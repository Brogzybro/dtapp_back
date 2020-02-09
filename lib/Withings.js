const Token = require('../models/WithingsToken');
const Config = require('../config/index.js').withings;
const querystring = require('querystring');
const request = require('request');
const reqSuper = require('superagent');

exports.checkTokenValidity = async user => {
  const token = await Token.findOne({ user: user._id });
  const { access_token: accessToken } = token.data;
  const { getDeviceURL } = Config;
  console.log(accessToken);
  try {
    const res = await reqSuper
      .get(getDeviceURL)
      .auth(accessToken, { type: 'bearer' });
    // .Set('Authorization', 'Bearer ' + accessToken);
    const { status } = JSON.parse(res.text);
    if (status === 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

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
  const token = await Token.findOne({ user: user._id });
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
  return Token.create({ user: user._id, data: tokenData }).catch(
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
