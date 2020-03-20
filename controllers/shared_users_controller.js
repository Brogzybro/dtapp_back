const Sample = require('../models/sample_model');
const User = require('../models/user_model');
const SharedUser = require('../models/shared_user_model');
const logger = require('../config').winston.loggers.defaultLogger;
/** @typedef {import('../models/user_model').User} User */
/** @typedef {import('koa').Context} Context */

/**
 * Gets a list of users that share data with the user
 * @param {Context & {state: {user: User}}} ctx
 * @returns {string[]} List of user ids
 */
exports.sharedWithUser = async ctx => {
  const {
    user: { id: userId }
  } = ctx.state;

  const sharedUsers = await SharedUser.find({ shared_with: userId });
  if (!sharedUsers) {
    ctx.body = [];
    return;
  }
  ctx.body = sharedUsers.map(sharedUser => sharedUser.user._id);
};

/**
 * Gets a list of users that the user shares their data with
 * @param {Context & {state: {user: User}}} ctx
 * @returns {string[]} List of user ids
 */
exports.othersSharedWith = async ctx => {
  const {
    user: { id: userId }
  } = ctx.state;

  const sharedUsers = await SharedUser.find({ user: userId });
  if (!sharedUsers) {
    ctx.body = [];
    return;
  }
  ctx.body = sharedUsers.map(user => user.shared_with);
};

/**
 * Shares the user's data with another user
 * @param {Context & {state: {user: User}}} ctx
 */
exports.shareWith = async ctx => {
  const { user } = ctx.state;
  const { user: otherUserId } = ctx.query;

  logger.info('otherUserId %o', otherUserId);
  if (!otherUserId) {
    ctx.status = 400;
    ctx.body = { error: 'Missing user parameter.' };
    return;
  }

  const otherUser = await User.findById(otherUserId);
  logger.info('otherUser %o', otherUser);
  if (!otherUser) {
    ctx.status = 400;
    ctx.body = { error: 'User does not exist.' };
    return;
  }

  const result = await user.shareWith(otherUser);
  if (!result) {
    ctx.status = 422;
    ctx.body = { error: 'User already shared with.' };
    return;
  }

  ctx.status = 201;
  ctx.body = { message: 'Share created.' };
};
