const config = require('../config').withings;
const Withings = require('../lib/Withings');
const User = require('../models/User');
const koa = require('koa');

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
 * Happens when withings redirects user back to our url with
 * authorization code and state. Then requests access token.
 *
 * @param {koa.Context} ctx
 * @param ctx.query.code The authorization code
 * @param ctx.query.state The state
 */
exports.callback = async ctx => {
  const { state, code } = ctx.query; // state
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
