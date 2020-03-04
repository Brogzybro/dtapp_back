const User = require('../models/user_model');

/* Create user
  body {}
    username: name
    email: email
    password: password
*/
exports.create = async ctx => {
  const createdUser = await User.create(ctx.request.body).catch(err => {
    if (err && err.code === 11000) {
      ctx.status = 422;
      ctx.body = 'User already exists';
    } else if (err) {
      console.log(err);
      ctx.status = 400;
    }
  });
  if (createdUser) {
    ctx.state.user = createdUser;
    ctx.status = 201;
  }
};

/* Update user
 */
exports.update = async ctx => {
  let { user } = ctx.state;
  user.set(ctx.request.body);
  const updatedUser = await user.save().catch(err => {
    if (err && err.code === 11000) {
      ctx.status = 422;
      ctx.body = 'User already exists';
    } else if (err) {
      console.log(err);
      ctx.status = 400;
    }
  });
  if (updatedUser) {
    ctx.state.user = user;
    ctx.status = 201;
  }
};

// Get token
exports.token = async ctx => {
  const { user } = ctx.state;
  const { token } = await user.generateToken();
  ctx.body = { token };
};

exports.deviceToken = async ctx => {
  const { user } = ctx.state;
  const { token } = ctx.request.body;
  user.iOS.deviceTokens.addToSet(token);
  await user.save();
  ctx.status = 201;
};
