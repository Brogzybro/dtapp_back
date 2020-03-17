const Sample = require('../models/sample_model');
const SharedUser = require('../models/shared_user_model');
const logger = require('../config').winston.loggers.defaultLogger;
/** @typedef {import('../models/user_model').User} User */
/** @typedef {import('koa').Context} Context */

/**
 * Gets a list of users that the users shares their data with
 * @param {Context & {state: {user: User}}} ctx
 */
exports.sharedWithUser = async ctx => {
  const {
    user: { id: userId }
  } = ctx.state;

  logger.info('id %o', userId);

  const sharedUser = await SharedUser.findOne({ user: userId });
  if (!sharedUser) {
    ctx.body = [];
    return;
  }
  logger.info('shared with %o', sharedUser.shared_with);
  ctx.body = sharedUser.shared_with;

  // ctx.status = 503; // Service unavailable
  // ctx.body = 'incomplete';
};

/**
 * Gets a list of users that share data with the user
 * @param {Context & {state: {user: User}}} ctx
 */
exports.othersSharedWith = async ctx => {
  const { user } = ctx.state;

  let idOfUserToGet = user.id;

  ctx.status = 503; // Service unavailable
  ctx.body = 'incomplete';
};

/**
 * Shares the user's data with another user
 * @param {Context & {state: {user: User}}} ctx
 */
exports.shareWith = async ctx => {
  const { user } = ctx.state;

  let idOfUserToGet = user.id;

  ctx.status = 503; // Service unavailable
  ctx.body = 'incomplete';
};
