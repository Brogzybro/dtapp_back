const User = require('../models/User');
const fitbit = require('../lib/fitbit');

exports.auth = async(ctx) => {
  const { token } = ctx.query;
  const user = await User.findByToken(token);
  ctx.assert(user, 401);
  ctx.redirect(fitbit.getAuthURL(token));
};

exports.callback = async(ctx) => {
  const { state, code } = ctx.query;
  const user = await User.findByToken(state);
  ctx.assert(user, 401);
  await fitbit.callback(user, code);
  ctx.redirect('healthscraper://callback');
};
