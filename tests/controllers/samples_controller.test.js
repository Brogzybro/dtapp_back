const appPromise = require('../../App');
// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('../_helpers/jobstestlib');
const logger = require('../../config').winston.loggers.testLogger;
// eslint-disable-next-line no-unused-vars
const Agenda = require('agenda');
const supertest = require('supertest');
const User = require('../../models/user_model');
const WithingsJob = require('../../jobs/withings_job');
const mockData = require('../superagent-mock-data');
const WithingsToken = require('../../models/withings_token_model');
const FitbitJob = require('../../jobs/fitbit_job');
const SharedUser = require('../../models/shared_user_model');
// eslint-disable-next-line no-unused-vars
const SamplesController = require('../../controllers/samples_controller');

/**
 * @type http.Server
 */
let server;

/**
 * @type AApp
 */
let app;

const withingsTestUser = {
  username: 'withingstestuser',
  password: 'withingstestpassword'
};

beforeEach(async done => {
  testlib.enableWinstonLogs();
  const uri = await testlib.setupApp();
  app = await appPromise({ uri: uri });
  server = await app.listen(() => {
    logger.info('test server opened');
    done();
  }, true);
  // console.log('withings test js listening on ' + server.address().port);
});

afterEach(async done => {
  server.close(done);
});

class Helpers {
  static async createUserWithWithingsToken(userObject) {
    const user = await User.create(userObject);
    await WithingsToken.create({
      user: user,
      data: mockData.mockTokenValidAccessToken.data
    });
    return user;
  }

  static async allSyncjobs() {
    let samplesAdded = 0;
    samplesAdded += await WithingsJob.sync();
    samplesAdded += await FitbitJob();
    return samplesAdded;
  }
}

it('Should get samples from a shared user of the user', async done => {
  testlib.enableWinstonLogs();
  const userWithSamples = await Helpers.createUserWithWithingsToken(
    withingsTestUser
  );
  const samplesAdded = await Helpers.allSyncjobs();
  logger.info('samples added %d', samplesAdded);

  const user2Obj = {
    username: withingsTestUser.username + '2',
    password: withingsTestUser.password
  };

  const user2 = await User.create(user2Obj);

  const sharedUser = await SharedUser.create({ user: userWithSamples });
  await sharedUser.shareWith(user2);

  logger.info('is this undef? %o', userWithSamples.id);
  const res = await supertest(server)
    .get('/samples')
    .query({ otherUser: userWithSamples._id })
    .auth(user2Obj.username, user2Obj.password);

  expect(res.body.length).toBe(samplesAdded);

  logger.info(
    'sharedUser %o, user %o, token %o, resbody: %o',
    sharedUser,
    userWithSamples,
    await WithingsToken.findOne({ user: userWithSamples }),
    res.body
  );
  done();
});

it('Should only get samples from fitbit sources', async done => {
  await Helpers.createUserWithWithingsToken(withingsTestUser);
  await Helpers.allSyncjobs();
  const res = await supertest(server)
    .get('/samples')
    .auth(withingsTestUser.username, withingsTestUser.password)
    .query({ source: 'fitbit' });

  logger.info('#samples = %d', res.body.length);
  for (let sample of res.body) {
    logger.info('sample %o', sample.source);
    expect(sample.source).toEqual('fitbit');
  }
  // logger.info('status: %o, body: %o', res.status, res.body);
  done();
});
