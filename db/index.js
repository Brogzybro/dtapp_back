const mongoose = require('mongoose');

module.exports.init = config => {
  mongoose.connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
  return mongoose.connection;
};
