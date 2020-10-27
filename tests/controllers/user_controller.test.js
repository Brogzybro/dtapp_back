const testlib = require('../_helpers/jobstestlib');
const mockData = require('../superagent-mock-data');
const supertest = require('supertest');
const logger = require('../../config').winston.loggers.testLogger;
const User = require('../../models/user_model');

const app = new testlib.AppTester();

const testUser = {
  username: 'userblablablabla',
  password: 'mysecretpasswoopedy',
  birthDate: new Date(1995, 11, 17)
};

const testUser2 = {
  username: 'userbla',
  password: 'mysecretpasswoopedy',
  birthDate: new Date(1995, 11, 17)
};

describe('user controller group', () => {
  beforeEach(async () => {
    await app.setup();
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('create new user', async done => {
    const result = await supertest(app.connection.server)
      .post('/user')
      .send(testUser);
    expect(result.status).toEqual(201);
    done();
  });

  it('change password should succeed', async done => {
    await supertest(app.connection.server)
      .post('/user')
      .send(testUser);
    const newUserDetails = {
      username: testUser.username,
      password: 'mynewpassword',
      birthDate: new Date(1995, 11, 17)
    };
    const result = await supertest(app.connection.server)
      .patch('/user')
      .send(newUserDetails)
      .auth(testUser.username, testUser.password);
    expect(result.status).toEqual(201);
    done();
  });

  it("changing username shouldn't work", async done => {
    await supertest(app.connection.server)
      .post('/user')
      .send(testUser);
    const newUserDetails = {
      username: 'mynewusernameaylmao',
      password: testUser.password,
      birthDate: new Date(1995, 11, 17)

    };
    const result = await supertest(app.connection.server)
      .patch('/user')
      .send(newUserDetails)
      .auth(testUser.username, testUser.password);
    expect(await User.find({ username: newUserDetails.username })).toEqual([]);
    expect(result.status).toEqual(201);
    done();
  });

  it('create user that already exists should fail', async done => {
    await supertest(app.connection.server)
      .post('/user')
      .send(testUser);
    const result = await supertest(app.connection.server)
      .post('/user')
      .send(testUser);
    logger.info('users %o', await User.find());
    expect(result.status).toEqual(422);
    done();
  });
});
