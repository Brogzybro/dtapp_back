const config = require('../config').withings;
const Withings = require('../lib/withings_lib');
const User = require('../models/user_model');
/** @typedef {import('koa').Context} Context */

exports.checkTokenValidity = async ctx => {
  const { user } = ctx.state;
  ctx.body = await Withings.checkTokenValidity(user);
  ctx.status = 200;
};

exports.auth = async ctx => {
  const { token } = ctx.query;
  const user = await User.findByToken(token);
  ctx.assert(user, 401);

  // ctx.redirect(authURL(token));
  ctx.redirect(Withings.authURL(token));
};

/**
 * @typedef {Object} QueryData
 * @property {string} code The authorization code
 * @property {string} state The state
 */

/**
 * Happens when withings redirects user back to our url with
 * authorization code and state. Then requests access token.
 *
 * TODO query is broken, it doesn't show properties just "any"
 * @param {Context & {query: QueryData}} ctx
 */
exports.callback = async ctx => {
  const { state, code } = ctx.query;
  const { clientID, clientSecret, redirectURI } = config;
  const user = await User.findByToken(state);
  ctx.assert(user, 401);
  // if(req.query)
  if (code) {
    const data = await Withings.accessTokenRequest({
      grant_type: 'authorization_code',
      client_id: clientID,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectURI
    }).catch(err => {
      ctx.status = 400;
      ctx.body = err.message;
    });

    if (data) {
      Withings.newToken(user, data);
      ctx.status = 201;
      ctx.body = 'Withings authorized';
    }
  } else {
    ctx.status = 400;
    ctx.body = 'Must provide authorization code';
  }
};
