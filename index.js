const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const Agenda = require('agenda');

const db = require('./db');
const config = require('./config');

const routes = require('./routes/routes');

const app = new Koa();
const agenda = new Agenda();

app.use(logger());
app.use(bodyparser({ jsonLimit: 10000000 }));
app.use(routes.routes());
app.use(routes.allowedMethods());

app.listen(config.port);

agenda.mongo(db);
/*
const fitbitSync = require('./jobs/fitbit');
const monitors = require('./jobs/monitors');

agenda.define('fitbit sync', (job, done) => {
  console.log('Fitbit sync in progress');
  fitbitSync().then(done).catch(console.error);
});

agenda.define('monitor heartrate', (job, done) => {
  console.log('Checking heart rate');
  monitors.heartRate().then(done).catch(console.error);
});
*/
/*
(async() => {
  await agenda.start();
  await agenda.every('20 minutes', 'fitbit sync');
  await agenda.every('20 minutes', 'monitor heartrate');
})().catch(console.error);
*/
