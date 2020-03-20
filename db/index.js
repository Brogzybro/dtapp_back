const mongoose = require('mongoose');

module.exports.init = async config => {
  await mongoose.connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
  return mongoose.connection;
};
