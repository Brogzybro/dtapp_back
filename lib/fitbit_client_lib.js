const request = require('superagent');
const config = require('../config').fitbit;
const assert = require('assert');
const logger = require('../config').winston.loggers.fitbitLogger;

/**
 * Withings token data.
 * @typedef {Object<string, any>} FitbitDeviceInfo
 * @property {string} battery
 * @property {number} batteryLevel
 * @property {string} deviceVersion
 * @property {Array} features
 * @property {string} id
 * @property {string} lastSyncTime
 * @property {string} mac
 * @property {string} type
 */

class FitbitClient {
  constructor(user) {
    this.user = user;
  }

  /**
   *
   * @param {*} user
   * @returns {Promise<[FitbitDeviceInfo]>} List of devices
   */
  async getDevices() {
    const body = await this.request('/1/user/-/devices.json');

    logger.info('body: %o', body);
    return body.map(device => ({ ...device, source: 'fitbit' }));
  }

  async checkTokenValidity() {
    try {
      const res = await this.postTokenState();
      const { body } = res;

      return body.active;
    } catch (error) {
      console.log('err: ', error);
      console.log('acess token may be invalid, trying refresh token');
      try {
        await this.refresh();
        const res = await this.postTokenState();
        const { body } = res;
        return body.active;
      } catch (e) {
        console.log('error after refresh still', e);
      }
    }
    return false;
  }

  async postTokenState() {
    const { accessToken } = this.user.fitbit;
    const { tokenStateURL } = config;
    console.log(accessToken);
    return request
      .post(tokenStateURL)
      .set('Authorization', 'Bearer ' + accessToken)
      .type('application/x-www-form-urlencoded')
      .send({
        token: accessToken
      });
  }

  authURL(state) {
    const { clientID, scope, redirectURI } = config;
    const url = new URL(config.authURL);
    const params = url.searchParams;
    params.set('client_id', clientID);
    params.set('response_type', 'code');
    params.set('scope', scope);
    params.set('expires_in', 31536000);
    params.set('response_type', 'code');
    params.set('redirect_uri', redirectURI);
    params.set('state', state);
    return url;
  }

  async refresh() {
    const { user } = this;
    const { refreshToken } = user.fitbit;
    const { tokenURL, clientID, clientSecret } = config;
    const res = await request
      .post(tokenURL)
      .auth(clientID, clientSecret)
      .type('form')
      .send({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });

    const { body } = res;
    user.set('fitbit.accessToken', body.access_token);
    user.set('fitbit.refreshToken', body.refresh_token);
    await user.save();
  }

  async callback(code) {
    const { user } = this;
    const { tokenURL, clientID, clientSecret, redirectURI } = config;
    const res = await request
      .post(tokenURL)
      .auth(clientID, clientSecret)
      .type('form')
      .send({
        code,
        grant_type: 'authorization_code',
        client_id: clientID,
        redirect_uri: redirectURI
      });

    const { body } = res;
    user.set('fitbit.userID', body.user_id);
    user.set('fitbit.accessToken', body.access_token);
    user.set('fitbit.refreshToken', body.refresh_token);
    await user.save();
  }

  async request(endpoint) {
    const { accessToken } = this.user.fitbit;
    const url = new URL(endpoint, config.apiURL);

    var res = await request
      .get(url)
      .buffer() // Buffer binary response
      .auth(accessToken, { type: 'bearer' })
      .catch(async err => {
        assert(err.response, err);

        // The fitbit API returns errors as octet streams, which is not parsed by superagent
        const buf = err.response.body;
        let { errors } = JSON.parse(buf.toString());

        assert(errors, err);
        console.log('Got errors from fitbit:', errors, this.user);

        // Check if token is expired
        const expired = errors.find(e => e.errorType === 'expired_token');
        assert(expired, err);

        await this.refresh();
        return this.request(endpoint);
      });

    return res.body;
  }

  profile() {
    return this.request('/1/user/-/profile.json');
  }

  activityTimeSeries(activity, start, end, granularity = '1min') {
    const { timezone } = this.user.fitbit;

    const startTZ = start.setZone(timezone);
    const startDate = startTZ.toFormat('yyyy-MM-dd');
    const startTime = startTZ.toFormat('HH:mm');

    const endTZ = end.setZone(timezone);
    const endDate = endTZ.toFormat('yyyy-MM-dd');
    const endTime = endTZ.toFormat('HH:mm');

    return this.request(
      `/1/user/-/activities/${activity}/date/${startDate}/${endDate}/${granularity}/time/${startTime}/${endTime}.json`
    );
  }

  heartRate(start, end) {
    return this.activityTimeSeries('heart', start, end, '1sec');
  }

  steps(start, end) {
    return this.activityTimeSeries('steps', start, end);
  }

  elevation(start, end) {
    return this.activityTimeSeries('elevation', start, end);
  }

  distance(start, end) {
    return this.activityTimeSeries('distance', start, end);
  }

  sleep(after) {
    const { timezone } = this;
    const afterDate = after.setZone(timezone).toFormat("yyyy-MM-dd'T'HH:mm:ss");

    const params = new URLSearchParams();
    params.set('sort', 'asc');
    params.set('afterDate', afterDate);
    params.set('limit', 100); // Maximum limit
    params.set('offset', 0);

    return this.request(`/1.2/user/-/sleep/list.json?${params}`);
  }
}

module.exports = FitbitClient;
