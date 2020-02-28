const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const send = require('koa-send');
const koaSwagger = require('koa2-swagger-ui');
const Agenda = require('agenda');
const cors = require('koa2-cors');
const fitbitSync = require('./jobs/fitbit_job');

// Limit array length prints to 10
require('util').inspect.defaultOptions.maxArrayLength = 10;

const routes = require('./routes/routes');

const DB = require('./db');

const logger = require('./config').winston.loggers.withings;

function initWinston() {
  logger.error('yo error');
  logger.info('yo error');
  logger.warn('yo warn');
}

module.exports = mongoConfig => {
  const app = new Koa();
  const agenda = new Agenda();
  const db = DB.init(mongoConfig);

  initWinston();

  app.use(cors());
  app.use(bodyparser({ jsonLimit: 10000000 }));
  app.use(routes.routes());
  app.use(routes.allowedMethods());
  app.use(
    koaSwagger({
      routePrefix: '/swagger',
      swaggerOptions: {
        url: './swagger.json'
      }
    })
  );
  routes.get('/swagger.json', async ctx => {
    await send(ctx, 'dtapp_shared/swagger.json');
  });

  agenda.mongo(db);

  agenda.define('fitbit sync', (job, done) => {
    console.log('Fitbit sync in progress');
    fitbitSync()
      .then(done)
      .catch(console.error);
  });
  agenda.define('withings sync', (job, done) => {
    console.log('Withings sync in progress');
    require('./jobs/withings')()
      .then(done)
      .catch(console.error);
  });
  (async () => {
    await agenda.start();
    await agenda.every('20 minutes', 'fitbit sync');
    await agenda.every('20 minutes', 'withings sync');
    // await agenda.every('20 minutes', 'monitor heartrate');
  })().catch(console.error);

  /*
  const monitors = require('./jobs/monitors');
  
  agenda.define('monitor heartrate', (job, done) => {
    console.log('Checking heart rate');
    monitors.heartRate().then(done).catch(console.error);
  });
  */
  return app;
};
