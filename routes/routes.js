const Router = require('koa-router');

const errors = require('./middleware/errors');
const auth = require('./middleware/auth');
const adminauth = require('./middleware/admin_auth');
const sharing = require('./middleware/sharing');

const healthkit = require('../controllers/healthkit_controller');
const fitbit = require('../controllers/fitbit_controller');
const withings = require('../controllers/withings_controller');
const user = require('../controllers/user_controller');
const samples = require('../controllers/samples_controller');
const adminController = require('../controllers/admin_controller');
const devicesController = require('../controllers/devices_controller');
const sharedUsers = require('../controllers/shared_users_controller');
const prediction = require('../controllers/prediction_controller');
const certificate = require('../controllers/certificate_controller');
const certificateAgreement = require('../controllers/certificate_user_agreement_controller');

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
 *          - birthDate
 *        properties:
 *          username:
 *            type: string
 *          password:
 *            type: string
 *          birthDate:
 *            type: integer
 *      Type:
 *        description: Enum of all the different types of samples supported by the API.
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
 *      Device:
 *        type: object
 *        properties:
 *          type:
 *            type: string
 *          battery:
 *            type: string
 *          model:
 *            type: string
 *          source:
 *            type: string
 *      Certificate:
 *        type: object
 *        required:
 *          - password
 *          - title
 *          - description
 *          - email
 *          - nameOfApplier
 *          - reasonsForDataNeed
 *        properties:
 *          title:
 *            type: string
 *          password:
 *            type: string
 *          description:
 *            type: string
 *          email:
 *            type: string
 *          nameOfApplier:
 *            type: string
 *          reasonsForDataNeed:
 *            type: string
 *          dataTypes:
 *            type: array
 *            items:
 *              type: string
 *
 *
 * tags:
 *    - name: user
 *      description: Create and modify user, and generate token
 *    - name: withings
 *      description: Add authorization for Withings
 *    - name: fitbit
 *      description: Add authorization for Fitbit
 *    - name: samples
 *      description: Access samples owned by or shared with  user
 *    - name: devices
 *      description: Access devices owned by or shared with user
 *    - name: sharing
 *      description: Add and remove users shared with, as well as get lists of them
 *    - name: prediction
 *      description: Returns predictions
 *    - name: certificate
 *      description: Apply and use certificates to collect donated data
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
 *      description: Adds a token to user (used for fitbit and withings auth)
 *      tags:
 *        - user
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
 *            type: integer
 *          required: false
 *          description: Start date to filter after
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: integer
 *          required: false
 *          description: End date to filter before
 *        - in: query
 *          name: source
 *          schema:
 *            type: string
 *          required: false
 *          description: Limit to one type of source
 *        - in: query
 *          name: otherUser
 *          schema:
 *            type: string
 *          required: false
 *          description: Username of another user to get samples for
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
router.get('/samples', auth, sharing, samples.list);

/**
 * @swagger
 *
 * /devices:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Get devices
 *      tags:
 *        - devices
 *      parameters:
 *        - in: query
 *          name: otherUser
 *          schema:
 *            type: string
 *          required: false
 *          description: Username of another user to get devices for
 *      responses:
 *        default:
 *          description: List of devices
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Device'
 */
router.get('/devices', auth, sharing, devicesController.list);

router.get('/admin', adminauth, adminController.adminCommand);

/**
 * @swagger
 *
 * /shared-users/shared-with-user:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Get a list of users shared with the current user
 *      tags:
 *        - sharing
 *      responses:
 *        default:
 *          description: List of usernames shared with the user
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                items:
 *                  type: string
 */
router.get('/shared-users/shared-with-user', auth, sharedUsers.sharedWithUser);

/**
 * @swagger
 *
 * /shared-users/others-shared-with:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Get a list of users the user has shared with
 *      tags:
 *        - sharing
 *      responses:
 *        default:
 *          description: List of usernames shared with
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                items:
 *                  type: string
 */
router.get(
  '/shared-users/others-shared-with',
  auth,
  sharedUsers.othersSharedWith
);

/**
 * @swagger
 *
 * /shared-users:
 *    post:
 *      security:
 *        - basicAuth: []
 *      description: Share samples with another user
 *      tags:
 *        - sharing
 *      requestBody:
 *        description: Username of user to share with
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                otherUser:
 *                  type: string
 *                  description: username of user to share with
 *      responses:
 *        '201':
 *          description: Share created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Success message
 *        '422':
 *          description: Duplicate, user already shared with
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    description: Error message
 *        '400':
 *          description: Failed other, description in error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    description: Error message
 */
router.post('/shared-users', auth, sharedUsers.add);

/**
 * @swagger
 *
 * /shared-users/{user}:
 *    delete:
 *      security:
 *        - basicAuth: []
 *      description: Stop sharing samples with another user
 *      tags:
 *        - sharing
 *      parameters:
 *        - in: path
 *          name: user
 *          schema:
 *            type: string
 *          required: true
 *          description: Username of user to stop sharing with
 *      responses:
 *        '200':
 *          description: Share removed
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Success message
 *        '400':
 *          description: Failed other, description in error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    description: Error message
 */
router.delete('/shared-users/:user', auth, sharedUsers.remove);

/**
 * @swagger
 *
 * /shared-users:
 *    delete:
 *      security:
 *        - basicAuth: []
 *      description: Stop sharing samples with all users
 *      tags:
 *        - sharing
 *      responses:
 *        '200':
 *          description: Shares removed
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Success message
 */
router.delete('/shared-users', auth, sharedUsers.removeAll);

/**
 * @swagger
 *
 * /prediction:
 *    get:
 *      security:
 *        - basicAuth: []
 *      description: Get a prediction
 *      tags:
 *        - prediction
 *      responses:
 *        default:
 *          description: User must have logged Blood pressure
 *        200:
 *          description: Risk based on diastolic and systolic blood pressure
 *          content:  
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  systolic:
 *                    type: integer
 *                  diastolic: 
 *                    type: integer
 *                  risk:
 *                    type: object
 *                    
 *          
 */
router.get('/prediction', auth, prediction.getPrediction);

/**
 * @swagger
 *
 * /certificate:
 *    post:
 *      description: Creates a new certificate
 *      tags:
 *        - certificate
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Certificate'
 *      responses:
 *        201:
 *          description: Created, use your CertificateKey to get data.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  certificateKey:
 *                    type: string
 *            
 *        400:
 *          description: Other/unkown
 */
router.post('/certificate', certificate.create);

/**
 * @swagger
 *
 * /certificate/data:
 *    get:
 *      description: Get data for certificate
 *      tags:
 *        - certificate
 *      parameters:
 *        - in: query
 *          name: certificateKey
 *          schema:
 *            type: string
 *          required: true
 *          description: Your certificate key given when you submitted for a certificate
 *        - in: query
 *          name: fromDate
 *          schema: 
 *            type: string
 *          description: Dates as String format "YYYY-mm-dd"
 *        - in: query
 *          name: toDate
 *          schema: 
 *            type: string
 *          description: Dates as String format "YYYY-mm-dd"
 *      responses:
 *        default:  
 *          description: Request accepted
 *        200:
 *          description: List of sample data
 *          content:
 *            application/json:
 *              schema:
 *                  items:
 *                    type: object
 *        401:
 *          description: Certificate is not approved
 *        400:
 *          description: Bad request
 */
router.get('/certificate/data', certificate.getData);

/**
 * @swagger
 *
 * /certificate/approve:
 *    patch:
 *      description: Make certificate approved
 *      tags:
 *        - certificate
 *      parameters:
 *        - in: query
 *          name: certificateKey
 *          schema:
 *            type: string
 *          required: true
 *          description: Certificate key of the certificate
 *      responses:
 *        default:
 *          description: Certificate approved
 *            
 */
router.patch('/certificate/approve', adminauth, certificate.approveCert);

/**
 * @swagger
 *
 * /certificate/disapprove:
 *    patch:
 *      description: Make certificate disapproved
 *      tags:
 *        - certificate
 *      parameters:
 *        - in: query
 *          name: certificateKey
 *          schema:
 *            type: string
 *          required: true
 *          description: Certificate key of the certificate
 *      responses:
 *        default:
 *          description: Certificate disapproved
 *            
 */
router.patch('/certificate/disapprove', adminauth, certificate.disapproveCert);

/**
 * @swagger
 *
 * /certificate/getAllApprovedCerts:
 *    get:
 *      description: Get all approved Certificates
 *      tags:
 *        - certificate
 *      responses:
 *        default:  
 *          description: Request accepted
 *        200:
 *          description: List of Certificates
 *          content:
 *            application/json:
 *              schema:
 *                  items:
 *                    $ref: '#/components/schemas/Certificate'
 *        400:
 *          description: No certificate found
 */
router.get('/certificate/getAllApprovedCerts', certificate.getAllApprovedCerts);

/**
 * @swagger
 *
 * /certificate/getAllDisapprovedCerts:
 *    get:
 *      description: Get all disapproved Certificates
 *      tags:
 *        - certificate
 *      responses:
 *        default:  
 *          description: Request accepted
 *        200:
 *          description: List of Certificates
 *          content:
 *            application/json:
 *              schema:
 *                  items:
 *                    $ref: '#/components/schemas/Certificate'
 *        400:
 *          description: No certificate found
 */
router.get('/certificate/getAllDisapprovedCerts', certificate.getAllDisapprovedCerts);


/**
 * @swagger
 *
 * /certificate/agree:
 *    post:
 *      security:
 *        - basicAuth: []
 *      description: Agree to a certificate
 *      tags:
 *        - certificate
 *      parameters:
 *       - in: query
 *         name: certificateKey
 *         schema:
 *           type: string
 *         required: true
 *         description: Certificate key of the certificate
 *      responses:
 *        default:
 *          description: User agreed to donate to certificate holder
 *        200:
 *          description: User agreed to donate to certificate holder
 *                                    
 */
router.post('/certificate/agree', auth, certificateAgreement.create);

/**
 * @swagger
 *
 * /certificate/agree:
 *    delete:
 *      security:
 *        - basicAuth: []
 *      description: Delete an agreement
 *      tags:
 *        - certificate
 *      parameters:
 *       - in: query
 *         name: certificateKey
 *         schema:
 *           type: string
 *         required: true
 *         description: Certificate key of the certificate
 *      responses:
 *        default:
 *          description: User deleted the agreement
 *        200:
 *          description: User deleted the agreement
 *                                    
 */
router.delete('/certificate/agree', auth, certificateAgreement.delete);

router.use(errors);

module.exports = router;
