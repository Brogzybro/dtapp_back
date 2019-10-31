const mongoose = require('mongoose');
const config = require('../config').mongo;

mongoose.connect(config.uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

module.exports = mongoose.connection;
