const request = require('superagent');
const qs = require('querystring');
const format = require('dateformat');
const config = require('../config').fitbit;

// TODO: CSRF Protection
// TODO: Investigate why auto-refresh won't work

const fitbit = {
  get authURL() {
    const params = qs.stringify({
      client_id: config.clientID,
      response_type: 'code',
      scope: config.scope,
      expires_in: 31536000,
      redirect_uri: config.redirectURI
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
        .auth(user.fitbit.accessToken, { type: 'bearer' });
    } catch (err) {
      const { errors } = err.response.body;
      console.log(err.response.body);
      if (errors) {
        const expired = errors.find(e => e.error_type === 'expired_token');
        if (expired) {
          await fitbit.refresh(user);
          return fitbit.request(user, endpoint);
        }
      }

      throw err;
    }

    return res.body;
  },

  activityTimeSeries(activity, user, start, end) {
    const fromDate = format(start, 'yyyy-mm-dd');
    const fromTime = format(start, 'HH:MM');
    const toDate = format(end, 'yyyy-mm-dd');
    const toTime = format(end, 'HH:MM');
    const url = `/1/user/-/activities/${activity}/date/${fromDate}/${toDate}/1min/time/${fromTime}/${toTime}.json`;
    return fitbit.request(user, url);
  },

  heartRate(user, start, end) {
    return fitbit.activityTimeSeries('heart', user, start, end);
  },

  steps(user, start, end) {
    return fitbit.activityTimeSeries('heart', user, start, end);
  },

  elevation(user, start, end) {
    return fitbit.activityTimeSeries('elevation', user, start, end);
  },

  distance(user, start, end) {
    return fitbit.activityTimeSeries('distance', user, start, end);
  }
};

module.exports = fitbit;
