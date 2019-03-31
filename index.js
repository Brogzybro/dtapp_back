const mongoose = require('mongoose');
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');
const logger = require('koa-logger');

const config = require('./config');
const errors = require('./controllers/errors');
const healthkit = require('./controllers/healthkit');
const fitbit = require('./controllers/fitbit');
const auth = require('./controllers/auth');
const user = require('./controllers/user');

const app = new Koa();
const router = new Router();

mongoose.connect(config.mongo.uri);

router.post('/user', user.create);
router.patch('/user', auth, user.update);

router.post('/healthkit', auth, healthkit.sync);

router.get('/fitbit/auth', auth, fitbit.auth);
router.get('/fitbit/callback', auth, fitbit.callback);
router.get('/fitbit/heartrate', auth, fitbit.heartrate);

app.use(errors.handle);
app.use(logger());
app.use(bodyparser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
