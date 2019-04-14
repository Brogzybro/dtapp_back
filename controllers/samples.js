const Sample = require('../models/Sample');

exports.list = async(ctx) => {
  const { user } = ctx.state;
  const { type, startDate, endDate } = ctx.query;

  const query = Sample.find({ user: user.id });

  if (type) {
    query.where('type').eq(type);
  }

  if (startDate) {
    query.where('startDate').gte(startDate);
  }

  if (endDate) {
    query.where('endDate').lte(endDate);
  }

  ctx.body = await query;
};
