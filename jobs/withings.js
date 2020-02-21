const request = require('superagent');
const config = require('../config');
const Token = require('../models/WithingsToken');
const Sample = require('../models/Sample');
const Withings = require('../lib/Withings');

async function sync() {
  console.log('[JOB WITHINGS SYNC] Running...');
  const { measureUrl } = config.withings;
  const tokens = await Token.find({});
  const samples = [];
  for await (const token of tokens) {
    const { data, user: userId } = token;
    const { access_token: accessToken, refresh_token: refreshToken } = data;

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

  console.log('[JOB WITHINGS SYNC]', samples);
  console.log('[JOB WITHINGS SYNC]', 'Added ' + samples.length + ' samples.');
  await Sample.insertMany(samples);
  console.log('[JOB WITHINGS SYNC] Ended');
}

async function syncHeart(userId, accessToken, refreshToken) {
  const { heartListURL, heartGetURL } = config.withings;

  const queries = {};

  const res = await request
    .get(heartListURL)
    .auth(accessToken, { type: 'bearer' })
    .query(queries);

  const { status, body } = JSON.parse(res.text);

  if (status === 401) {
    console.log('status 401');
    await Withings.refreshUserToken(userId, refreshToken);
    return await sync();
  }

  // console.log(body);

  const ecgRefs = body.series.map(val => {
    return {
      signalid: val.ecg.signalid,
      timestamp: val.timestamp
    };
  });

  // console.log(ecgRefs);

  const ecgs = [];
  for await (const ecgRef of ecgRefs) {
    try {
      const ress = await request
        .get(heartGetURL)
        .auth(accessToken, { type: 'bearer' })
        .query({ signalid: ecgRef.signalid });
      const { status: statuss, body: bodyy } = JSON.parse(ress.text);
      console.log(statuss);
      console.log(bodyy);
      ecgs.push({
        timestamp: ecgRef.timestamp,
        signalid: ecgRef.signalid,
        signal: bodyy.signal,
        sampling_frequency: bodyy.sampling_frequency,
        wearposition: bodyy.wearposition
      });
    } catch (error) {
      console.log(error);
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
    // console.log('latest time: ' + latestTime);
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

    const res = await request
      .get(measureUrl)
      .auth(accessToken, { type: 'bearer' })
      .query(queries);

    // Parsing is broken for some reason, manually parse instead
    const { status, body } = JSON.parse(res.text);

    if (status === 401) {
      await Withings.refreshUserToken(userId, refreshToken);
      return await sync();
    }

    // console.log(body);
    // console.log(body.measuregrps.length);
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
    console.log('withings job sync err:' + error);
    return [];
  }
}

module.exports = sync;
