const config = require('./config');
const logger = require('koa-logger');

const mongoConfig = require('./config').mongo;
const appPromise = require('./App');

appPromise(mongoConfig).then(app => {
  app.use(logger());
  app.addJobs();
  const server = app.listen(config.port);
  if (server) {
    console.log('Server listening on: ' + config.port);
  }
});
