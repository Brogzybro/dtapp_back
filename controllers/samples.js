const Sample = require('../models/Sample');

exports.list = async(ctx) => {
  const { user } = ctx.state;
  const { type, startDate, endDate, limit, offset } = ctx.query;

  const query = Sample
    .find({ user: user.id })
    .sort('-startDate');

  if (type) {
    query.where('type').eq(type);
  }

  if (startDate) {
    query.where('startDate').gte(parseInt(startDate));
  }

  if (endDate) {
    query.where('endDate').lte(parseInt(endDate));
  }

  if (limit) {
    query.limit(parseInt(limit));
  }

  if (offset) {
    query.skip(parseInt(offset));
  }

  ctx.body = await query;
};
