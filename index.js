const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');
const logger = require('koa-logger');
const Agenda = require('agenda');

const db = require('./db');
const config = require('./comfig');
const errors = require('./middleware/errors');
const auth = require('./middleware/auth');

const healthkit = require('./controllers/healthkit');
const fitbit = require('./controllers/fitbit');
const user = require('./controllers/user');
const samples = require('./controllers/samples');

const app = new Koa();
const router = new Router();
const agenda = new Agenda();

router.get('/', auth, async(ctx) => {
  ctx.status = 204;
});

router.post('/user', user.create);
router.patch('/user', auth, user.update);
router.post('/user/token', auth, user.token);

router.post('/healthkit', auth, healthkit.sync);

router.get('/fitbit/auth', fitbit.auth);
router.get('/fitbit/callback', fitbit.callback);

router.get('/samples', auth, samples.list);

app.use(logger());
app.use(errors);
app.use(bodyparser({ jsonLimit: 10000000 }));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port);

agenda.mongo(db);

const fitbitSync = require('./jobs/fitbit');

agenda.define('fitbit sync', (job, done) => {
  console.log('Fitbit sync in progress');
  fitbitSync().then(done).catch(console.error);
});

(async() => {
  await agenda.start();
  await agenda.every('20 minutes', 'fitbit sync');
})().catch(console.error);
