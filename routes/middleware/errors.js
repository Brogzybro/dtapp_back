module.exports = async(ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);

    if (err.name === 'ValidationError') {
      err.status = 400;
      err.expose = true;
    }

    if (err.expose) {
      const status = err.status || 500;
      ctx.body = { error: err.message, status };
      ctx.status = status;
    }
  }
};
