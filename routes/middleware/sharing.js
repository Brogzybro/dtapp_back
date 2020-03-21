const User = require('../../models/user_model');

const sharing = async (ctx, next) => {
  const { user } = ctx.state;
  const { otherUser: otherUsername } = ctx.query;

  if (otherUsername) {
    const otherUser = await User.findOne({ username: otherUsername });
    if (otherUser && (await otherUser.isSharedWith(user))) {
      ctx.state.user = otherUser;
      await next();
      return;
    } else {
      ctx.body = { error: 'Access denied, user has not shared data with you.' };
      ctx.status = 401;
      return;
    }
  }
  await next();
};

module.exports = sharing;
