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

  const sharedUsers = await SharedUser.find({ shared_with: userId }).populate(
    'user'
  );
  if (!sharedUsers) {
    ctx.body = [];
    return;
  }
  ctx.body = sharedUsers.map(sharedUser => sharedUser.user.username);
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

  const sharedUsers = await SharedUser.find({ user: userId }).populate(
    'shared_with'
  );
  if (!sharedUsers) {
    ctx.body = [];
    return;
  }

  ctx.body = sharedUsers.map(user => user.shared_with.username);
};

/**
 * Shares the user's data with another user
 * @param {Context & {state: {user: User}}} ctx
 */
exports.add = async ctx => {
  const { user } = ctx.state;
  const { otherUser: otherUsername } = ctx.request.body;

  logger.info('otherUsername %o', otherUsername);
  if (!otherUsername) {
    ctx.status = 400;
    ctx.body = { error: 'Missing user parameter.' };
    return;
  }

  const otherUser = await User.findOne({ username: otherUsername });
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

/**
 * Shares the user's data with another user
 * @param {Context & {state: {user: User}}} ctx
 */
exports.remove = async ctx => {
  const { user } = ctx.state;
  const { user: usernameOfUserToRemove } = ctx.params;

  logger.info('usernameOfUserToRemove %o', usernameOfUserToRemove);
  if (!usernameOfUserToRemove) {
    ctx.status = 400;
    ctx.body = { error: 'Missing user parameter.' };
    return;
  }

  const userToRemove = await User.findOne({ username: usernameOfUserToRemove });
  logger.info('otherUser %o', userToRemove);
  if (!userToRemove) {
    ctx.status = 400;
    ctx.body = { error: 'User does not exist.' };
    return;
  }

  // Should never fail, if user is not shared with it still succeeds
  await user.removeShare(userToRemove);

  ctx.status = 200;
  ctx.body = { message: 'Share removed.' };
};

/**
 * Shares the user's data with another user
 * @param {Context & {state: {user: User}}} ctx
 */
exports.removeAll = async ctx => {
  const { user } = ctx.state;

  // Should never fail, if user is not shared with it still succeeds
  await user.removeShareAll();

  ctx.status = 200;
  ctx.body = { message: 'Shares removed.' };
};
