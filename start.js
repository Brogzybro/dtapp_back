const app = require('./index.js');
const config = require('./config');
const logger = require('koa-logger');

app.use(logger());
app.listen(config.port);
