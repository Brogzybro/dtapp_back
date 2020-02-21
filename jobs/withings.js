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
    console.log('latest time: ' + latestTime);
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
    console.log(body);
    const measures = body.measuregrps.map(grp => {
      console.log(grp);
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
