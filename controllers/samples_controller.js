const Sample = require('../models/sample_model');

exports.list = async ctx => {
  const { user } = ctx.state;
  const { type, startDate, endDate, limit, offset } = ctx.query;

  const query = Sample.find({ user: user.id }).sort('-startDate');

  console.log('Sample request from user ' + user);
  console.log('type: ' + type);
  console.log('startDate: ' + startDate);
  console.log('endDate: ' + endDate);
  console.log('limit: ' + limit);
  console.log('offset: ' + offset);

  if (type) {
    query.where('type').eq(type);
  }

  if (startDate) {
    query.where('startDate').gte(parseInt(startDate));
  }

  if (endDate) {
    query.where('endDate').lte(parseInt(endDate));
  }

  // Hard limit to not run out of memory
  // (~80k-85k records causes issues, 256 MB limit on Heroku)
  var nlimit = 20000;
  if (limit < nlimit) nlimit = limit;
  if (limit < 1) nlimit = 1;
  query.limit(parseInt(nlimit));

  if (offset) {
    query.skip(parseInt(offset));
  }

  const ret = await query;
  console.log(ret.length);
  ctx.body = ret;
};
