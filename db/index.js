const mongoose = require('mongoose');
const config = require('../config').mongo;

mongoose.connect(config.uri);

module.exports = mongoose.connection;
