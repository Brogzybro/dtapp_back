const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const send = require('koa-send');
const koaSwagger = require('koa2-swagger-ui');
const Agenda = require('agenda');

const routes = require('./routes/routes');

const mongoConfig = require('./config').mongo;
const db = require('./db').init(mongoConfig);

const app = new Koa();
const agenda = new Agenda();

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
  await send(ctx, 'swagger.json');
});

agenda.mongo(db);

const fitbitSync = require('./jobs/fitbit');

agenda.define('fitbit sync', (job, done) => {
  console.log('Fitbit sync in progress');
  fitbitSync()
    .then(done)
    .catch(console.error);
});
(async () => {
  await agenda.start();
  await agenda.every('20 minutes', 'fitbit sync');
  // await agenda.every('20 minutes', 'monitor heartrate');
})().catch(console.error);
/*
const monitors = require('./jobs/monitors');

agenda.define('monitor heartrate', (job, done) => {
  console.log('Checking heart rate');
  monitors.heartRate().then(done).catch(console.error);
});
*/
/*
 */
module.exports = app;
