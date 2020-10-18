// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('../_helpers/jobstestlib');
const logger = require('../../config').winston.loggers.testLogger;
// eslint-disable-next-line no-unused-vars
const Agenda = require('agenda');
const supertest = require('supertest');
const User = require('../../models/user_model');
const WithingsToken = require('../../models/withings_token_model');
const SharedUser = require('../../models/shared_user_model');
// eslint-disable-next-line no-unused-vars
const SamplesController = require('../../controllers/samples_controller');
const { Helpers } = require('../_helpers/apphelpers');

const app = new testlib.AppTester();

const withingsTestUser = {
  username: 'withingstestuser',
  password: 'withingstestpassword',
  birthDate: new Date(1995, 11, 17)
};

const user2Obj = {
  username: withingsTestUser.username + '2',
  password: withingsTestUser.password,
  birthDate: new Date(1995, 11, 17)
};

describe('samples controller group', () => {
  beforeEach(async () => {
    await app.setup();
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('should fail with 401 for user not shared with (has no users shared with)', async done => {
    console.log(" IN SAMPLES CONTROLLER TEST");
    const userWithSamples = await Helpers.createUserWithWithingsToken(
      withingsTestUser
    );
    const samplesAdded = await Helpers.allSyncjobs();
    logger.info('samples added %d', samplesAdded);

    const res = await supertest(app.connection.server)
      .get('/samples')
      .query({ otherUser: userWithSamples.username })
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

    await SharedUser.create({
      user: userWithSamples,
      shared_with: await User.create({
        username: 'yoyoyoyoy',
        password: 'yoyoyoyoyyo',
        birthDate: new Date(1995, 11, 17)
      })
    });

    await Helpers.createUser(user2Obj);

    const res = await supertest(app.connection.server)
      .get('/samples')
      .query({ otherUser: userWithSamples.username })
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

    const sharedUser = await SharedUser.create({
      user: userWithSamples,
      shared_with: user2
    });

    const res = await supertest(app.connection.server)
      .get('/samples')
      .query({ otherUser: userWithSamples.username })
      .auth(user2Obj.username, user2Obj.password);

    logger.info(
      'sharedUser %o, user %o, token %o, resbody: %o',
      sharedUser,
      userWithSamples,
      await WithingsToken.findOne({ user: userWithSamples }),
      res.body
    );
    expect(res.status).toBe(200);

    expect(res.body.length).toBe(samplesAdded);
    //expect(pred.body.length).toBe(samplesAdded);

    done();
  });

  it('Should only get samples from fitbit sources', async done => {
    await Helpers.createUserWithWithingsToken(withingsTestUser);
    await Helpers.allSyncjobs();
    const res = await supertest(app.connection.server)
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
    const res = await supertest(app.connection.server)
      .get('/samples')
      .auth(withingsTestUser.username, withingsTestUser.password);

    logger.info('#samples = %d', res.body.length);
    expect(res.body.length).toBeGreaterThan(0);

    // logger.info('status: %o, body: %o', res.status, res.body);
    done();
  });
});
