const User = require('../models/User');
const FitbitClient = require('../lib/FitbitClient');

exports.auth = async ctx => {
  const { token } = ctx.query;
  const user = await User.findByToken(token);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  ctx.redirect(client.authURL(token));
};

exports.callback = async ctx => {
  const { state, code } = ctx.query;
  const user = await User.findByToken(state);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  await client.callback(code);
  ctx.redirect('healthscraper://callback');
};
