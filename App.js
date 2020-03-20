const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const send = require('koa-send');
const koaSwagger = require('koa2-swagger-ui');
const Agenda = require('agenda');
const cors = require('koa2-cors');
const fitbitSync = require('./jobs/fitbit_job');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

// Limit array length prints to 10
require('util').inspect.defaultOptions.maxArrayLength = 10;

const routes = require('./routes/routes');

const DB = require('./db');

class AApp {
  /**
   * Creates an instance of AApp.
   * @param {Koa} app
   * @param {Agenda} agenda
   * @param {mongoose.Connection} db
   */
  constructor(app, agenda, db) {
    this.app = app;
    this.agenda = agenda;
    this.db = db;
  }
  listen(arg) {
    return this.app.listen(arg);
  }
  use(arg) {
    this.app.use(arg);
  }
  callback() {
    return this.app.callback();
  }
  async addJobs() {
    this.agenda.define('fitbit sync', (job, done) => {
      console.log('Fitbit sync in progress');
      fitbitSync()
        .then(done)
        .catch(console.error);
    });
    this.agenda.define('withings sync', (job, done) => {
      console.log('Withings sync in progress');
      require('./jobs/withings_job')
        .sync()
        .then(done)
        .catch(console.error);
    });
    await (async () => {
      await this.agenda.start();
      await this.agenda.every('20 minutes', 'fitbit sync');
      await this.agenda.every('20 minutes', 'withings sync');
      // await agenda.every('20 minutes', 'monitor heartrate');
    })().catch(console.error);
  }

  // Only run after tests to not run jobs accidently
  async end() {
    await this.agenda.purge();
  }
}

module.exports.AApp = AApp;
module.exports.getApp = async mongoConfig => {
  const app = new Koa();
  const agenda = new Agenda();
  const db = await DB.init(mongoConfig);

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

  /*
  const monitors = require('./jobs/monitors');
  
  agenda.define('monitor heartrate', (job, done) => {
    console.log('Checking heart rate');
    monitors.heartRate().then(done).catch(console.error);
  });
  */
  return new AApp(app, agenda, db);
};
