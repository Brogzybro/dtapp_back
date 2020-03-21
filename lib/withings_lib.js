const WithingsToken = require('../models/withings_token_model');
const Config = require('../config/index.js').withings;
const querystring = require('querystring');
const request = require('superagent');
const logger = require('../config').winston.loggers.withingsLogger;

/**
 * @typedef {Object} WithingsDevice
 * @property {string} type // Example: "Scale",
 * @property {string} battery // Example: "low",
 * @property {string} model // Example: "Body Cardio",
 * @property {number} model_id // Example: 6,
 * @property {string} timezone // Example: "Europe/Oslo",
 * @property {string} last_session_date // Example: 1583722027,
 * @property {string} deviceid // Example: "cea977b56062cf1ae75e8526b8a5c3e80f82406d"
 */
/**
 * @typedef {Object} WithingsResponse
 * @property {number} status // Example: 0,
 * @property {WithingsDevice[]} devices
 */

/**
 * Withings token data.
 * @typedef {Object<string, any>} DeviceInfo
 * @property {string} type
 * @property {string} battery
 * @property {string} model
 * @property {number} model_id
 * @property {string} timezone
 * @property {number} last_session_date
 * @property {string} deviceid
 * @property {string} source
 */
/**
 * @return {Promise<[DeviceInfo]>} List of devices
 */
module.exports.getDevices = async user => {
  const { _id: userId } = user;
  const token = await WithingsToken.findOne({ user: userId });
  logger.info('getdevices user: %o, token: %o', user, token);

  /** @type WithingsResponse */
  const body = await this.withingsRequest(
    () => request.get(Config.getDeviceURL),
    token
  );
  logger.info('body: %o', body);
  return body.devices.map(device => ({ ...device, source: 'withings' }));
};

module.exports.withingsRequest = async (requestFunc, token, attempt = 1) => {
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

    const newBody = await this.withingsRequest(requestFunc, token, ++attempt);
    return newBody;
  }
  return body;
};

/**
 * Withings token data.
 * @typedef {Object<string, any>} WithingsTokenData
 * @property {string} access_token The access token.
 * @property {number} expires_in
 * @property {string} token_type
 * @property {string} scope
 * @property {string} refresh_token The refresh token.
 * @property {number} userid
 */

/**
 * @returns {Promise<WithingsTokenData>} Withings Token
 */
module.exports.refreshUserToken = async (userId, refreshToken) => {
  const { clientID, clientSecret, tokenURL } = Config;
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
    if (!res.text) throw new Error('res.text missing in refreshUserToken');
    logger.info(
      'Refresh user token - status: %d, text: %s',
      res.status,
      res.text
    );
    if (res.status === 200) {
      /**
       * @type {WithingsTokenData} withings token data
       */
      const data = res.body;
      console.log(data);
      await WithingsToken.updateMany(
        { user: userId },
        { data: data },
        {
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      return data;
    }
  } catch (error) {
    console.log('withings refresh token err: ' + error);
    console.log(error.response.text);
  }
};

exports.checkTokenValidity = async user => {
  const token = await WithingsToken.findOne({ user: user._id });
  const { access_token: accessToken, refresh_token: refreshToken } = token.data;
  console.log(accessToken);
  try {
    return await postTokenValidity(accessToken);
  } catch (error) {
    console.log(error);
    console.log('access token likely ran out, trying refresh token');
    try {
      await this.refreshUserToken(user._id, refreshToken);
      return await postTokenValidity();
    } catch (error) {
      console.log('failed still after refresh', error);
    }
    return false;
  }
};

// TODO fix mess
async function postTokenValidity(accessToken) {
  const { getDeviceURL } = Config;
  try {
    const res = await request
      .get(getDeviceURL)
      .auth(accessToken, { type: 'bearer' });

    const { status } = JSON.parse(res.text);
    if (status === 0) {
      return true;
    }
    throw new Error('Token validity Status ' + status);
  } catch (error) {
    throw new Error(error);
  }
}

exports.authURL = (state, config = Config) => {
  const { clientID, scope, redirectURI } = config;
  const url = new URL(config.authURL);
  const params = url.searchParams;
  params.set('response_type', 'code');
  params.set('client_id', clientID);
  params.set('scope', scope);
  params.set('redirect_uri', redirectURI);
  params.set('state', state);
  return url;
};

/**
 * Creates a new token given a user and the token data
 *
 * @param user Should be active user with a ._id corresponding DB
 * @param tokenData Should be an object with all the data for a token
 *
 * @returns {boolean}
 */
exports.newToken = async (user, tokenData) => {
  if (!user._id) {
    return false;
  }

  // If a token already exists, update it
  const token = await WithingsToken.findOne({ user: user._id });
  if (token) {
    token.user = user._id;
    token.data = tokenData;
    return token.save().catch((err, mdata) => {
      console.log('token update err: \n\t' + err);
    });
    /*
    return Token.updateOne(tokenData).catch((err, mdata) => {
      console.log('token update err: \n\t' + err);
    });
    */
  }

  // If token doens't exist create it
  return WithingsToken.create({ user: user._id, data: tokenData }).catch(
    (err, mdata) => {
      console.log('token create err: \n\t' + err);
    }
  );
};

exports.accessTokenRequest = body => {
  const { tokenURL } = Config;
  return new Promise((resolve, reject) => {
    request(
      {
        uri: tokenURL,
        method: 'POST',
        body: querystring.stringify(body)
      },
      (error, response, body) => {
        if (!error) {
          if (response.statusCode === 200) {
            const data = JSON.parse(body);
            resolve(data);
          } else if (response.statusCode === 401) {
            reject(new Error('Invalid authorization code'));
          } else {
            reject(new Error('Unknown status code returned'));
          }
        } else {
          reject(new Error('Request error.'));
        }
      }
    );
  });
};
