const Token = require('../models/WithingsToken');
const Config = require('../config/index.js').withings;
const querystring = require('querystring');
const request = require('request');
const reqSuper = require('superagent');

module.exports.refreshUserToken = async (userId, refreshToken) => {
  const { clientID, clientSecret, tokenURL } = Config;
  const queries = {
    grant_type: 'refresh_token',
    client_id: clientID,
    client_secret: clientSecret,
    refresh_token: refreshToken
  };

  try {
    const res = await reqSuper
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
};

exports.checkTokenValidity = async user => {
  const token = await Token.findOne({ user: user._id });
  const { access_token: accessToken } = token.data;
  console.log(accessToken);
  try {
    return await postTokenValidity(accessToken);
  } catch (error) {
    console.log(error);
    console.log('access token likely ran out, trying refresh token');
    try {
      await this.refreshUserToken();
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
    const res = await reqSuper
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
