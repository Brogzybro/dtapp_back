const Token = require('../models/WithingsToken');
const Config = require('../config/index.js').withings;
const querystring = require('querystring');
const request = require('request');

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
 */
exports.newToken = async (user, tokenData) => {
  tokenData.user = user._id;
  const token = await Token.create(tokenData).catch((err, mdata) => {
    console.log('token create err: ' + err);
  });
  console.log(token);
};

exports.accessTokenRequest = body => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: 'https://account.withings.com/oauth2/token',
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
