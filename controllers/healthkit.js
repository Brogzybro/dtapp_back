const Sample = require('../models/Sample');

// Save data from healthkit
exports.sync = async(ctx) => {
  const { body } = ctx.request;
  const { user } = ctx.state;

  ctx.assert(Array.isArray(body), 400);

  body.forEach(sample => {
    sample.user = user;
    sample.source = 'healthKit';
  });

  await Sample.insertMany(body);
  ctx.status = 201;
};
