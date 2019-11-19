const config = require('./config');
const logger = require('koa-logger');

const mongoConfig = require('./config').mongo;
const app = require('./App')(mongoConfig);

app.use(logger());
const server = app.listen(config.port);
if (server) {
  console.log('Server listening on: ' + config.port);
}
