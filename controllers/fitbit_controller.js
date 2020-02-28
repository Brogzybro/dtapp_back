const User = require('../models/user');
const FitbitClient = require('../lib/fitbit_client');

exports.auth = async ctx => {
  const { token } = ctx.query;
  const user = await User.findByToken(token);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  ctx.redirect(client.authURL(token));
};

exports.checkTokenValidity = async ctx => {
  const { user } = ctx.state;
  const client = new FitbitClient(user);

  ctx.body = await client.checkTokenValidity();
  ctx.status = 200;
};

exports.callback = async ctx => {
  const { state, code } = ctx.query;
  const user = await User.findByToken(state);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  await client.callback(code);
  ctx.body = 'Fitbit connected';
  ctx.status = 201;
};
