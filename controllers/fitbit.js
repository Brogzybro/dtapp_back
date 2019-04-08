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

exports.heartrate = async(ctx) => {
  const { user } = ctx.state;
  const start = new Date('2018-12-09 23:00');
  const end = new Date('2018-12-10 01:00');
  ctx.body = await fitbit.heartRate(user, start, end);
};

exports.sleep = async(ctx) => {
  const { user } = ctx.state;
  const after = new Date('2018-01-01 23:00');
  ctx.body = await fitbit.sleep(user, after);
};
