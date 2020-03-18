const Sample = require('../models/sample_model');
const logger = require('../config').winston.loggers.defaultLogger;
const User = require('../models/user_model');

exports.list = async ctx => {
  const { user } = ctx.state;
  const {
    type,
    startDate,
    endDate,
    limit,
    offset,
    source,
    otherUser: otherUsername
  } = ctx.query;

  let idOfUserToGet = user.id;

  logger.info('otherUser %o', otherUsername);
  if (otherUsername) {
    const otherUser = await User.findOne({ username: otherUsername });
    if (otherUser && (await otherUser.isSharedWith(user))) {
      logger.info('Is Shared with');
      idOfUserToGet = otherUser.id;
    } else {
      ctx.status = 401;
      ctx.body = 'Access denied, user has not shared data with you.';
      return;
    }
  }

  const query = Sample.find({ user: idOfUserToGet }).sort('-startDate');

  logger.info(
    'Sample request from user ' +
      user +
      '{type: ' +
      type +
      ', startDate: ' +
      startDate +
      ', endDate: ' +
      endDate +
      ', limit: ' +
      limit +
      ', offset: ' +
      offset +
      ', source: ' +
      source +
      '}'
  );

  if (source) {
    query.where('source').eq(source);
  }

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
