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

const user2Obj = {
  username: withingsTestUser.username + '2',
  password: withingsTestUser.password
};

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
describe('samples controller group', () => {
  beforeEach(async done => {
    const uri = await testlib.setupApp();
    app = await appPromise({ uri: uri });
    server = await app.listen(done, true);
    // console.log('withings test js listening on ' + server.address().port);
  });

  afterEach(async done => {
    server.close(done);
  });

  it('should fail with 401 for user not shared with (has no users shared with)', async done => {
    const userWithSamples = await Helpers.createUserWithWithingsToken(
      withingsTestUser
    );
    const samplesAdded = await Helpers.allSyncjobs();
    logger.info('samples added %d', samplesAdded);

    const res = await supertest(server)
      .get('/samples')
      .query({ otherUser: userWithSamples.id })
      .auth(user2Obj.username, user2Obj.password);

    expect(res.status).toBe(401);
    done();
  });

  it('should fail with 401 for user not shared with (has at least one users shared)', async done => {
    const userWithSamples = await Helpers.createUserWithWithingsToken(
      withingsTestUser
    );
    const samplesAdded = await Helpers.allSyncjobs();
    logger.info('samples added %d', samplesAdded);

    const sharedUser = await SharedUser.create({ user: userWithSamples });
    // await sharedUser.shareWith(user2);
    await sharedUser.shareWith(
      await User.create({ username: 'yoyoyoyoy', password: 'yoyoyoyoyyo' })
    );

    const res = await supertest(server)
      .get('/samples')
      .query({ otherUser: userWithSamples.id })
      .auth(user2Obj.username, user2Obj.password);

    expect(res.status).toBe(401);
    done();
  });

  it('Should get samples from a shared user of the user', async done => {
    const userWithSamples = await Helpers.createUserWithWithingsToken(
      withingsTestUser
    );
    const samplesAdded = await Helpers.allSyncjobs();
    logger.info('samples added %d', samplesAdded);

    const user2 = await User.create(user2Obj);

    const sharedUser = await SharedUser.create({ user: userWithSamples });
    // await sharedUser.shareWith(user2);
    await sharedUser.shareWith(user2);

    const res = await supertest(server)
      .get('/samples')
      .query({ otherUser: userWithSamples.id })
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

  it('Should get more than 0 samples', async done => {
    await Helpers.createUserWithWithingsToken(withingsTestUser);
    await Helpers.allSyncjobs();
    const res = await supertest(server)
      .get('/samples')
      .auth(withingsTestUser.username, withingsTestUser.password);

    logger.info('#samples = %d', res.body.length);
    expect(res.body.length).toBeGreaterThan(0);

    // logger.info('status: %o, body: %o', res.status, res.body);
    done();
  });
});
