const request = require('superagent');
const config = require('../config');
const Token = require('../models/WithingsToken');
const Sample = require('../models/Sample');
const Withings = require('../lib/Withings');
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

    logger.info('yooo');

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
  const res = await request.auth(accessToken, { type: 'bearer' });

  // Parsing is broken for some reason, manually parse instead
  const { status, body } = JSON.parse(res.text);

  if (status === 401) {
    if (attempt > 3)
      throw new Error(
        'Failed withings auth after 3 failed attempts (' +
          userId +
          ', ' +
          accessToken +
          ', ' +
          refreshToken +
          '). ' +
          process.env.NODE_ENV
      );
    logger.error('status 401 ' + userId + accessToken + refreshToken + Date());
    await Withings.refreshUserToken(userId, refreshToken);
    await withingsRequest(
      request,
      userId,
      accessToken,
      refreshToken,
      ++attempt
    );
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
    logger.info('withings job sync err:' + error);
    return [];
  }
}

module.exports = sync;
