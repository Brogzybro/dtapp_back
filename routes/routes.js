const Router = require('koa-router');

const errors = require('./middleware/errors');
const auth = require('./middleware/auth');
const adminauth = require('./middleware/adminauth');

const healthkit = require('../controllers/healthkit');
const fitbit = require('../controllers/fitbit');
const withings = require('../controllers/withings');
const user = require('../controllers/user');
const samples = require('../controllers/samples');

const router = new Router();

/**
 * @swagger
 *
 * components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - password
 *          - username
 *        properties:
 *          username:
 *            type: string
 *          password:
 *            type: string
 *
 * tags:
 *    - name: user
 *      description: Everything to do with user
 *    - name: withings
 *      description: Everything to do with withings
 */

router.get('/', auth, async ctx => {
  ctx.status = 204;
});

/**
 * @swagger
 *
 * /user:
 *    post:
 *      description: Creates a new user
 *      tags:
 *        - user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        201:
 *          description: Created
 *        422:
 *          description: User already exists
 *        400:
 *          description: Other/Unknown
 */
router.post('/user', user.create);

/**
 * @swagger
 *
 * /user:
 *    patch:
 *      description: Modify the logged in user
 *      tags:
 *        - user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        201:
 *          description: Updated
 *        422:
 *          description: New username already exists
 *        400:
 *          description: Other/Unknown
 */
router.patch('/user', auth, user.update);

/**
 * @swagger
 *
 * /user/token:
 *    post:
 *      description: Adds a token to user (used for fitbit auth)
 *      tags:
 *        - fitbit
 *      responses:
 *        default:
 *          description: Object containing the token
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  token:
 *                    type: string
 *                    description: The token
 */
router.post('/user/token', auth, user.token);
router.post('/user/ios/device', auth, user.deviceToken);

router.post('/healthkit', auth, healthkit.sync);

router.get('/fitbit/auth', fitbit.auth);
router.get('/fitbit/callback', fitbit.callback);

/**
 * @swagger
 *
 * /withings/auth:
 *    get:
 *      description: Starts the authentication process for withings api
 *      tags:
 *        - withings
 *      responses:
 *        302:
 *          description: Redirects to withings website
 */
router.get('/withings/auth', auth, withings.auth);
router.get('/withings/callback', auth, withings.callback);

router.get('/samples', auth, samples.list);

router.get('/admin', adminauth, ctx => {
  ctx.status = 200;
  if (ctx.query && ctx.query.action) {
    switch (ctx.query.action) {
      case 'fitbitsync':
        require('../jobs/fitbit')();
        break;
      default:
        console.log('Unrecognized admin command');
        break;
    }
  }
});

router.use(errors);

module.exports = router;
