const Router = require('koa-router');

const errors = require('./middleware/errors');
const auth = require('./middleware/auth');
const adminauth = require('./middleware/admin_auth');

const healthkit = require('../controllers/healthkit_controller');
const fitbit = require('../controllers/fitbit_controller');
const withings = require('../controllers/withings_controller');
const user = require('../controllers/user_controller');
const samples = require('../controllers/samples_controller');
const adminController = require('../controllers/admin_controller');

const router = new Router();

/**
 * @swagger
 *
 *
 *
 * components:
 *    securitySchemes:
 *      basicAuth:
 *        type: http
 *        scheme: basic
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
 *      Type:
 *        type: string
 *        enum:
 *          - heartRate
 *          - distance
 *          - elevation
 *          - stepCount
 *          - sleep
 *          - diastolicBloodPressure
 *          - systolicBloodPressure
 *          - ecg
 *          - weight
 *          - fatFreeMass
 *          - fatRatio
 *          - fatMassWeight
 *          - bodyTemp
 *          - muscleMass
 *          - boneMass
 *          - pulseWaveVelocity
 *      Sample:
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *          user:
 *            type: string
 *          value:
 *            type: object
 *          startDate:
 *            type: integer
 *          endDate:
 *            type: integer
 *          type:
 *            $ref: '#/components/schemas/Type'
 *          source:
 *            type: string
 *          __v:
 *            type: integer
 *
 * tags:
 *    - name: user
 *      description: Everything to do with user
 *    - name: withings
 *      description: Everything to do with withings
 */

/**
 * @swagger
 *
 * /:
 *   get:
 *     security:
 *        - basicAuth: []
 *     description: Default route (used for tesing login)
 *     tags:
 *       - user
 *     responses:
 *       204:
 *         description: Success
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
 *      security:
 *        - basicAuth: []
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

/**
 * @swagger
 *
 * /fitbit/auth:
 *    get:
 *      description: Auth fitbit
 *      tags:
 *        - fitbit
 *      parameters:
 *        - in: query
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: User token retrieved from /user/token
 *      responses:
 *        302:
 *          description: Redirect to fitbit auth website
 */
router.get('/fitbit/auth', fitbit.auth);
router.get('/fitbit/callback', fitbit.callback);

/**
 * @swagger
 *
 * /fitbit/isauthorized:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Check if user has fitbit authorized
 *      tags:
 *        - fitbit
 *      responses:
 *        200:
 *          description: Is the user authorized
 *          content:
 *            application/json:
 *              schema:
 *                type: boolean
 *                description: Is valid
 */
router.get('/fitbit/isauthorized', auth, fitbit.checkTokenValidity);

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
router.get('/withings/auth', withings.auth);
router.get('/withings/callback', withings.callback);

/**
 * @swagger
 *
 * /withings/isauthorized:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Check if user has withings authorized
 *      tags:
 *        - withings
 *      responses:
 *        200:
 *          description: Is the user authorized
 *          content:
 *            application/json:
 *              schema:
 *                type: boolean
 *                description: Is valid
 */
router.get('/withings/isauthorized', auth, withings.checkTokenValidity);

/**
 * @swagger
 *
 * /samples:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Get samples
 *      tags:
 *        - samples
 *      parameters:
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *          required: false
 *          description: Numeric limit of entries to retrieve
 *        - in: query
 *          name: offset
 *          schema:
 *            type: integer
 *          required: false
 *          description: Numeric offset of entries to skip
 *        - in: query
 *          name: type
 *          schema:
 *              $ref: '#/components/schemas/Type'
 *          required: false
 *          description: Data type
 *        - in: query
 *          name: startDate
 *          schema:
 *            type: int
 *          required: false
 *          description: Start date to filter after
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: int
 *          required: false
 *          description: End date to filter before
 *      responses:
 *        default:
 *          description: Sample entries requested
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Sample'
 */
router.get('/samples', auth, samples.list);

router.get('/admin', adminauth, adminController.adminCommand);

router.use(errors);

module.exports = router;
