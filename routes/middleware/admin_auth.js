const auth = require('basic-auth');
const AdminPass = require('../../config').admin_pass;

const authenticate = async (ctx, next) => {
  const { pass } = auth(ctx.req) || {};

  if (pass === AdminPass) {
    await next();
  } else {
    ctx.set('WWW-Authenticate', 'Basic realm="API"');
    ctx.status = 401;
  }
};

module.exports = authenticate;
