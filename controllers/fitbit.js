const fitbit = require('../lib/fitbit');

exports.auth = async(ctx) => {
  ctx.redirect(fitbit.authURL);
};

exports.callback = async(ctx) => {
  const { user } = ctx.state;
  const { code } = ctx.query;
  await fitbit.callback(user, code);
  ctx.redirect('healthscraper://callback');
};

exports.heartrate = async(ctx) => {
  const { user } = ctx.state;
  const start = new Date('2018-12-09 23:00');
  const end = new Date('2018-12-10 01:00');
  ctx.body = await fitbit.heartRate(user, start, end);
};
