const Sample = require('../models/sample_model');
const SharedUser = require('../models/shared_user_model');
const logger = require('../config').winston.loggers.defaultLogger;

exports.sharedWithUser = async ctx => {
  const { user } = ctx.state;

  let idOfUserToGet = user.id;

  ctx.status = 503; // Service unavailable
  ctx.body = 'incomplete';
};
exports.othersSharedWith = async ctx => {
  const { user } = ctx.state;

  let idOfUserToGet = user.id;

  ctx.status = 503; // Service unavailable
  ctx.body = 'incomplete';
};
exports.shareWith = async ctx => {
  const { user } = ctx.state;

  let idOfUserToGet = user.id;

  ctx.status = 503; // Service unavailable
  ctx.body = 'incomplete';
};
