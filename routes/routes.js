const Router = require('koa-router');

const errors = require('./middleware/errors');
const auth = require('./middleware/auth');

const healthkit = require('../controllers/healthkit');
const fitbit = require('../controllers/fitbit');
const withings = require('../controllers/withings');
const user = require('../controllers/user');
const samples = require('../controllers/samples');

const router = new Router();

router.get('/', auth, async(ctx) => {
  ctx.status = 204;
});

router.post('/user', user.create);
router.patch('/user', auth, user.update);

router.post('/user/token', auth, user.token);
router.post('/user/ios/device', auth, user.deviceToken);

router.post('/healthkit', auth, healthkit.sync);

router.get('/fitbit/auth', fitbit.auth);
router.get('/fitbit/callback', fitbit.callback);

router.get('/withings/auth', withings.auth);
router.get('/withings/callback', withings.callback);

router.get('/samples', auth, samples.list);

router.use(errors);

module.exports = router;
