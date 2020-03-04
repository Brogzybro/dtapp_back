const request = require('superagent');
const config = require('../config');
const WithingsToken = require('../models/withings_token_model');
const Sample = require('../models/sample_model');
const logger = config.winston.loggers.withings;
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

async function sync() {
  logger.info('[JOB] Running...');
  const samples = [];
  for await (const token of WithingsToken.find()) {
    // TODO: make into class so refresh token is updated betwenn calls

    logger.info('syncing user %o', token.user);

    samples.push(...(await syncSleep(token)));

    samples.push(...(await syncHeart(token)));

    for await (const measureEntry of MEASURES) {
      samples.push(...(await syncMeasure(token, measureEntry)));
    }
  }

  logger.verbose('[JOB] Samples: %o', samples);
  logger.info('[JOB] Added ' + samples.length + ' samples.');
  await Sample.insertMany(samples);
  logger.info('[JOB] Ended');
}

/**
 *
 * @param {function(): request.SuperAgentRequest} requestFunc Function that returns superagent request
 *  // Done because if you create and use the same request object it will only be called once.
 */
async function withingsRequest(requestFunc, token, attempt = 1) {
  const { data, user: userId } = token;
  const { access_token: accessToken, refresh_token: refreshToken } = data;
  // TODO fix this shit
  // This doesn't run after the second time, just returns the same data
  const request = requestFunc();
  const res = await request.auth(accessToken, { type: 'bearer' });

  // Parsing is broken for some reason, manually parse instead
  if (!res || !res.text) throw new Error('res.text not set, unexpected');
  const { status, body } = JSON.parse(res.text);

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
    logger.error('status 401 %o, %o, %o', userId, accessToken, refreshToken);
    await token.refresh();

    const newBody = await withingsRequest(requestFunc, token, ++attempt);
    return newBody;
  }
  return body;
}

/**
 *
 * @param {mongoose.Document} token Withings token
 */
async function syncSleep(token) {
  const { sleepSummaryURL } = config.withings;
  const { user: userId } = token;

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
    () => request.get(sleepSummaryURL).query(params),
    token
  );

  const seriesRelevant = body.series.map(serie => {
    return {
      startdate: serie.startdate, // Seconds since epoch
      enddate: serie.enddate, // Seconds since epoch
      data: serie.data,
      modified: serie.modified // Creation/modified date used for lastupdate sync
    };
  });

  logger.verbose('series relevant: %o', seriesRelevant);

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
 * @param {mongoose.Document} token Withings token
 */
async function syncHeart(token) {
  const { heartListURL, heartGetURL } = config.withings;
  const { user: userId } = token;

  const latest = await Sample.findLatest({
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

  // logger.info('latestTimee ' + params.startdate);

  const body = await withingsRequest(
    () => request.get(heartListURL).query(params),
    token
  );

  if (!body.series) {
    logger.warn('body had no series');
    return [];
  }

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
      const body = await withingsRequest(
        () => request.get(heartGetURL).query({ signalid: ecgRef.signalid }),
        token
      );
      logger.verbose('body: %o', body);
      ecgs.push({
        timestamp: ecgRef.timestamp,
        signalid: ecgRef.signalid,
        signal: body.signal,
        sampling_frequency: body.sampling_frequency,
        wearposition: body.wearposition
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
    type: 'weight',
    value: 1
  },
  {
    type: 'fatFreeMass',
    value: 5
  },
  {
    type: 'fatRatio',
    value: 6
  },
  {
    type: 'fatMassWeight',
    value: 8
  },
  {
    type: 'bodyTemp',
    value: 71
  },
  {
    type: 'muscleMass',
    value: 76
  },
  {
    type: 'boneMass',
    value: 88
  },
  {
    type: 'pulseWaveVelocity',
    value: 91
  },
  {
    type: 'diastolicBloodPressure',
    value: 9
  },
  {
    type: 'systolicBloodPressure',
    value: 10
  }
];

/**
 *
 * @param {mongoose.Document} token Withings token
 * @param {Object} measureEntry Object describing measure
 */
async function syncMeasure(token, measureEntry) {
  const { measureUrl } = config.withings;
  const { user: userId } = token;
  const samples = [];
  const latest = await Sample.findLatest({
    user: userId,
    type: measureEntry.type,
    source: 'withings'
  });

  var latestTime = null;
  if (latest) {
    // Because the withings api is retarded and does not track lastupdate properly
    // we add 5 seconds, we might lose a measure because of this, but fuck it
    latestTime = latest.startDate.getTime() / 1000 + 5; // + 5;
    // logger.info('latest time: ' + latestTime);
    // logger.info(latestTime);
  }

  try {
    // request.parse['text/json'] = text => JSON.parse(text);
    const queries = {
      action: 'getmeas',
      meastype: measureEntry.value
    };
    if (latestTime) {
      queries.startdate = latestTime;
      // queries.lastupdate = 1570458535;
    }

    const body = await withingsRequest(
      () => request.get(measureUrl).query(queries),
      token
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
