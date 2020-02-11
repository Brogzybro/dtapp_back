const request = require('superagent');
const config = require('../config');
const Token = require('../models/WithingsToken');
const Sample = require('../models/Sample');

async function refreshUserToken(userId, refreshToken) {
  const { clientID, clientSecret, tokenURL } = config.withings;
  const queries = {
    grant_type: 'refresh_token',
    client_id: clientID,
    client_secret: clientSecret,
    refresh_token: refreshToken
  };

  try {
    const res = await request
      .post(tokenURL)
      .type('form')
      .send(queries);
    console.log('yooo');
    console.log(res);
    if (res.status === 200) {
      const data = res.body;
      console.log(data);
      await Token.updateMany(
        { user: userId },
        { data: data },
        {
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
    }
  } catch (error) {
    console.log('withings refresh token err: ' + error);
    console.log(error.text);
  }
}

async function sync() {
  console.log("[JOB WITHINGS SYNC] Running...");
  const { measureUrl } = config.withings;
  const tokens = await Token.find({});
  const samples = [];
  for await (const token of tokens) {
    const { data, user: userId } = token;
    const { access_token: accessToken, refresh_token: refreshToken } = data;

    samples.push(
      ...(await syncMeasure(
        userId,
        'diastolicBloodPressure',
        accessToken,
        refreshToken,
        measureUrl
      ))
    );
    samples.push(
      ...(await syncMeasure(
        userId,
        'systolicBloodPressure',
        accessToken,
        refreshToken,
        measureUrl
      ))
    );
  }

  console.log("Adding " + samples.length + " samples.");
  console.log(samples);
  await Sample.insertMany(samples);
  console.log("[JOB WITHINGS SYNC] Ended");
}

const meastypeMap = {
  diastolicBloodPressure: 9,
  systolicBloodPressure: 10
};

async function syncMeasure(
  userId,
  type,
  accessToken,
  refreshToken,
  measureUrl
) {
  const samples = [];
  const latest = await Sample.findLatest({
    user: userId,
    type: type,
    source: 'withings'
  });

  var latestTime = null;
  if (latest) {
    latestTime = latest.startDate.getTime() / 1000 + 1;
  }

  try {
    // request.parse['text/json'] = text => JSON.parse(text);
    const queries = {
      action: 'getmeas',
      meastype: meastypeMap[type]
    };
    if (latestTime) {
      queries.lastupdate = latestTime;
    }

    const res = await request
      .get(measureUrl)
      .auth(accessToken, { type: 'bearer' })
      .query(queries);

    // Parsing is broken for some reason, manually parse instead
    const { status, body } = JSON.parse(res.text);

    if (status === 401) {
      refreshUserToken(userId, refreshToken);
      return sync();
    }

    // console.log(body);
    // console.log(body.measuregrps.length);
    const measures = body.measuregrps.map(grp => {
      return {
        date: new Date(grp.date * 1000),
        value: grp.measures[0].value
      };
    });

    measures.forEach(measure => {
      samples.push(
        new Sample({
          user: userId,
          type: type,
          value: measure.value,
          startDate: measure.date,
          endDate: measure.date,
          source: 'withings'
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
