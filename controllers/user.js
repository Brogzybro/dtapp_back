const User = require('../models/User');

/* Create user
  body {}
    username: name
    email: email
    password: password
*/
exports.create = async(ctx) => {
  const user = await User.create(ctx.request.body);
  ctx.state.user = user;
  ctx.status = 201;
};

/* Update user
*/
exports.update = async(ctx) => {
  let { user } = ctx.state;
  user.set(ctx.request.body);
  await user.save();
  ctx.status = 200;
};

// Get token
exports.token = async(ctx) => {
  const { user } = ctx.state;
  const { token } = await user.generateToken();
  ctx.body = { token };
};

exports.deviceToken = async(ctx) => {
  const { user } = ctx.state;
  const { token } = ctx.request.body;
  user.iOS.deviceTokens.addToSet(token);
  await user.save();
  ctx.status = 201;
};
