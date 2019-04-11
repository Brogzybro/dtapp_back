const request = require('superagent');
const qs = require('querystring');
const config = require('../config').fitbit;
const { DateTime } = require('luxon');

const fitbit = {
  getAuthURL(state) {
    const params = qs.stringify({
      client_id: config.clientID,
      response_type: 'code',
      scope: config.scope,
      expires_in: 31536000,
      redirect_uri: config.redirectURI,
      state
    });

    return `${config.authURL}?${params}`;
  },

  async refresh(user) {
    console.log('Refreshing token');

    let res = await request
      .post(config.tokenURL)
      .auth(config.clientID, config.clientSecret)
      .type('form')
      .send({
        grant_type: 'refresh_token',
        refresh_token: user.fitbit.refreshToken
      });

    const { body } = res;
    console.log('Got response', body);
    user.set('fitbit.accessToken', body.access_token);
    user.set('fitbit.refreshToken', body.refresh_token);
    await user.save();
  },

  async callback(user, code) {
    let res = await request
      .post(config.tokenURL)
      .auth(config.clientID, config.clientSecret)
      .type('form')
      .send({
        code,
        grant_type: 'authorization_code',
        client_id: config.clientID,
        redirect_uri: config.redirectURI
      });

    const { body } = res;
    user.set('fitbit.userID', body.user_id);
    user.set('fitbit.accessToken', body.access_token);
    user.set('fitbit.refreshToken', body.refresh_token);
    await user.save();
  },

  async request(user, endpoint) {
    const url = config.apiURL + endpoint;

    try {
      var res = await request
        .get(url)
        .buffer() // Buffer binary response
        .auth(user.fitbit.accessToken, { type: 'bearer' });
    } catch (err) {
      // The fitbit API returns errors as octet streams, which is not parsed by superagent
      const buf = err.response.body;
      let { errors } = JSON.parse(buf.toString());
      console.log(`Got errors from fitbit:`, errors);

      if (errors) {
        const expired = errors.find(e => e.errorType === 'expired_token');
        if (expired) {
          await fitbit.refresh(user);
          return fitbit.request(user, endpoint);
        }
      }

      throw err;
    }

    return res.body;
  },

  profile(user) {
    return fitbit.request(user, '/1/user/-/profile.json');
  },

  activityTimeSeries(activity, user, start, end, granularity = '1min') {
    const { timezone } = user.fitbit;
    start.setZone(timezone);
    end.setZone(timezone);
    const startDate = start.toFormat('yyyy-MM-dd');
    const startTime = start.toFormat('HH:mm');
    const endDate = end.toFormat('yyyy-MM-dd');
    const endTime = end.toFormat('HH:mm');
    const url = `/1/user/-/activities/${activity}/date/${startDate}/${endDate}/${granularity}/time/${startTime}/${endTime}.json`;
    return fitbit.request(user, url);
  },

  heartRate(user, start, end) {
    return fitbit.activityTimeSeries('heart', user, start, end, '1sec');
  },

  steps(user, start, end) {
    return fitbit.activityTimeSeries('steps', user, start, end);
  },

  elevation(user, start, end) {
    return fitbit.activityTimeSeries('elevation', user, start, end);
  },

  distance(user, start, end) {
    return fitbit.activityTimeSeries('distance', user, start, end);
  },

  sleep(user, after) {
    const { timezone } = user.fitbit;
    const afterDate = after.setZone(timezone).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    const params = qs.stringify({
      sort: 'asc',
      afterDate,
      limit: 100,
      offset: 0
    });

    return fitbit.request(user, `/1.2/user/-/sleep/list.json?${params}`);
  }
};

module.exports = fitbit;
