const User = require('../models/User');

// Create user
exports.create = async(ctx) => {
  const user = await User.create(ctx.request.body);
  ctx.state.user = user;
  ctx.status = 201;
};

// Update user
exports.update = async(ctx) => {
  let { user } = ctx.state;
  user.set(ctx.request.body);
  await user.save();
  ctx.status = 200;
};
