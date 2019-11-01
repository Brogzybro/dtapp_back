const auth = require('basic-auth');
const User = require('../../models/User');

const authenticate = async(ctx, next) => {
  const { name, pass } = auth(ctx.req) || {};
  console.log(ctx.req);
  console.log('Name', name);
  const user = await User.findOne({ username: name });
  console.log('User', user);

  if (user && await user.authenticate(pass)) {
    ctx.state.user = user;
    await next();
  } else {
    ctx.set('WWW-Authenticate', 'Basic realm="API"');
    ctx.status = 401;
  }
};

module.exports = authenticate;
