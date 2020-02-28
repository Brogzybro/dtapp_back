const request = require('superagent');
const config = require('../config');
const Token = require('../models/withings_token');
const Sample = require('../models/sample');
const Withings = require('../lib/withings');
const logger = config.winston.loggers.withings;

async function sync() {
  logger.info('[JOB] Running...');
  logger.error('bro');
  const { measureUrl } = config.withings;
  const tokens = await Token.find({});
  const samples = [];
  for await (const token of tokens) {
    const { data, user: userId } = token;
    const { access_token: accessToken, refresh_token: refreshToken } = data;

    // TODO: make into class so refresh token is updated betwenn calls

    logger.info('userid %o', token.user);

    samples.push(...(await syncSleep(userId, accessToken, refreshToken)));

    samples.push(...(await syncHeart(userId, accessToken, refreshToken)));

    for await (const measureEntry of MEASURES) {
      samples.push(
        ...(await syncMeasure(
          userId,
          measureEntry,
          accessToken,
          refreshToken,
          measureUrl
        ))
      );
    }
  }

  logger.verbose('[JOB] Samples: %o', samples);
  logger.info('[JOB] Added ' + samples.length + ' samples.');
  await Sample.insertMany(samples);
  logger.info('[JOB] Ended');
}

async function syncSleep(userId, accessToken, refreshToken) {
  const { sleepSummaryURL } = config.withings;

  const latest = await Sample.findLatestModified({
    user: userId,
    type: 'sleep',
    source: 'withings'
  });

  const params = { lastupdate: 0 };

  if (latest) {
    // Milliseconds to seconds
    const latestTime = latest.modified;
    params.lastupdate = latestTime + 1;
  }

  const body = await withingsRequest(
    request.get(sleepSummaryURL).query(params),
    userId,
    accessToken,
    refreshToken
  );

  const seriesRelevant = body.series.map(serie => {
    return {
      startdate: serie.startdate, // Seconds since epoch
      enddate: serie.enddate, // Seconds since epoch
      data: serie.data,
      modified: serie.modified // Creation/modified date used for lastupdate sync
    };
  });

  logger.info('series relevant: %o', seriesRelevant);

  return seriesRelevant.map(serie => {
    return new Sample({
      user: userId,
      type: 'sleep',
      value: (serie.enddate - serie.startdate) * 1000, // Convert from s to ms, consistent with fitbit sleep
      metadata: serie.data,
      startDate: new Date(serie.startdate * 1000),
      endDate: new Date(serie.enddate * 1000),
      modified: serie.modified,
      source: 'withings'
    });
  });
}

/**
 *
 * @param {request.SuperAgentRequest} request The put together request
 */
async function withingsRequest(
  request,
  userId,
  accessToken,
  refreshToken,
  attempt = 1
) {
  // TODO fix this shit
  // This doesn't run after the second time, just returns the same data
  const res = await request.auth(accessToken, { type: 'bearer' });
  console.info('res accessToken', accessToken);
  console.info('res', res);

  // Parsing is broken for some reason, manually parse instead
  console.info('parsing json');
  if (!res || !res.text) throw new Error('res.text not set, unexpected');
  const { status, body } = JSON.parse(res.text);
  console.info('paresed json');

  if (status === 401) {
    if (attempt > 3)
      throw new Error(
        'Failed withings auth after 3 failed attempts (' +
          `userId: ${userId}` +
          `, accessToken: ${accessToken}` +
          `, refreshToken: ${refreshToken}` +
          `, node_env: ${process.env.NODE_ENV})`
      );
    logger.info('request %o', request.url);
    logger.error('status 401 ' + userId + accessToken + refreshToken + Date());
    const newToken = await Withings.refreshUserToken(userId, refreshToken);
    if (!newToken) throw new Error("Couldn'nt get new token");
    console.log('accesstoken', newToken.access_token);
    const newBody = await withingsRequest(
      request,
      userId,
      newToken.access_token,
      newToken.refresh_token,
      ++attempt
    );
    return newBody;
  }
  return body;
}

async function syncHeart(userId, accessToken, refreshToken) {
  const { heartListURL, heartGetURL } = config.withings;

  const latest = await Sample.findLatestCreated({
    user: userId,
    type: 'ecg',
    source: 'withings'
  });

  const params = {};

  if (latest) {
    // Milliseconds to seconds
    const latestTime = latest.startDate.getTime() / 1000;
    params.startdate = latestTime + 1;
  }

  const body = await withingsRequest(
    request.get(heartListURL).query(params),
    userId,
    accessToken,
    refreshToken
  );

  // logger.info(body);

  const ecgRefs = body.series.map(val => {
    return {
      signalid: val.ecg.signalid,
      timestamp: val.timestamp
    };
  });

  // logger.info(ecgRefs);

  const ecgs = [];
  for await (const ecgRef of ecgRefs) {
    try {
      const ress = await request
        .get(heartGetURL)
        .auth(accessToken, { type: 'bearer' })
        .query({ signalid: ecgRef.signalid });
      const { status: statuss, body: bodyy } = JSON.parse(ress.text);
      logger.verbose('statuss: %o', statuss);
      logger.verbose('bodyy: %o', bodyy);
      ecgs.push({
        timestamp: ecgRef.timestamp,
        signalid: ecgRef.signalid,
        signal: bodyy.signal,
        sampling_frequency: bodyy.sampling_frequency,
        wearposition: bodyy.wearposition
      });
    } catch (error) {
      logger.info(error);
    }
  }

  return ecgs.map(ecg => {
    return new Sample({
      user: userId,
      type: 'ecg',
      value: {
        signalid: ecg.signalid,
        signal: ecg.signal,
        sampling_frequency: ecg.sampling_frequency,
        wearposition: ecg.wearposition
      },
      startDate: new Date(ecg.timestamp * 1000),
      endDate: new Date(ecg.timestamp * 1000),
      source: 'withings'
    });
  });
}

const MEASURES = [
  {
    type: 'diastolicBloodPressure',
    value: 9
  },
  {
    type: 'systolicBloodPressure',
    value: 10
  }
];

async function syncMeasure(
  userId,
  measureEntry,
  accessToken,
  refreshToken,
  measureUrl
) {
  const samples = [];
  const latest = await Sample.findLatestCreated({
    user: userId,
    type: measureEntry.type,
    source: 'withings'
  });

  var latestTime = null;
  if (latest) {
    // Because the withings api is retarded and does not track lastupdate properly
    // we add 5 seconds, we might lose a measure because of this, but fuck it
    latestTime = latest.created.getTime() / 1000 + 5; // + 5;
    // logger.info('latest time: ' + latestTime);
  }

  try {
    // request.parse['text/json'] = text => JSON.parse(text);
    const queries = {
      action: 'getmeas',
      meastype: measureEntry.value
    };
    if (latestTime) {
      queries.lastupdate = latestTime;
      // queries.lastupdate = 1570458535;
    }

    const body = await withingsRequest(
      request.get(measureUrl).query(queries),
      userId,
      accessToken,
      refreshToken
    );

    // logger.info(body);
    // logger.info(body.measuregrps.length);
    const measures = body.measuregrps.map(grp => {
      return {
        grpid: grp.grpid,
        date: new Date(grp.date * 1000),
        value: grp.measures[0].value,
        created: new Date(grp.created * 1000)
      };
    });

    measures.forEach(measure => {
      samples.push(
        new Sample({
          user: userId,
          grpid: measure.grpid,
          type: measureEntry.type,
          value: measure.value,
          startDate: measure.date,
          endDate: measure.date,
          source: 'withings',
          created: measure.created
        })
      );
    });
    return samples;
  } catch (error) {
    logger.info('withings measure sync err:' + error);
    return [];
  }
}

module.exports = { sync, syncHeart, syncMeasure, syncSleep };
