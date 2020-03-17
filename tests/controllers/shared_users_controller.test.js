const testlib = require('../_helpers/jobstestlib');
const mockData = require('../superagent-mock-data');
const supertest = require('supertest');
const logger = require('../../config').winston.loggers.testLogger;
const { Helpers } = require('../_helpers/apphelpers');

const app = new testlib.AppTester();
beforeEach(async () => {
  await app.setup();
});
afterEach(async () => {
  await app.cleanup();
});

describe('/shared-users/shared-with-user', () => {
  it('share with five users', async () => {
    testlib.enableWinstonLogs();
    const usersObjsToShareWith = [...Array(5)].map((_, i) => ({
      username: mockData.mockUser.username + i,
      password: mockData.mockUser.password
    }));
    const usersToShareWith = await Promise.all(
      usersObjsToShareWith.map(async userObj => Helpers.createUser(userObj))
    );
    logger.info('arr %o', usersToShareWith);
    const userThatShares = await Helpers.createUser(mockData.mockUser);
    await Helpers.createSharedUser(userThatShares, usersToShareWith);
    const res = await supertest(app.connection.server)
      .get('/shared-users/shared-with-user')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res status %o, body %o', res.status, res.body);
    expect(res.body.length).toBe(5);
  });

  it('with collection entry, but empty returns empty array', async () => {
    const user = await Helpers.createUser(mockData.mockUser);
    await Helpers.createSharedUser(user);
    const res = await supertest(app.connection.server)
      .get('/shared-users/shared-with-user')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res status %o, body %o', res.status, res.body);
    expect(res.body.length).toBe(0);
  });

  it('with no shared users returns empty array', async () => {
    await Helpers.createUser(mockData.mockUser);
    const res = await supertest(app.connection.server)
      .get('/shared-users/shared-with-user')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res status %o, body %o', res.status, res.body);
    expect(res.body.length).toBe(0);
    // expect([401, 404]).not.toContain(res.status);
  });
});

describe('shared user controller endpoints should exist and be restricted ', () => {
  it('/shared-users/shared-with-user endpoint should exist and be restricted', async () => {
    const res = await supertest(app.connection.server)
      .get('/shared-users/shared-with-user')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res %o', res.status);
    expect(res.status).toBe(401); // not 404 implied
  });
  it('/shared-users/others-shared-with endpoint should exist and be restricted', async () => {
    const res = await supertest(app.connection.server)
      .get('/shared-users/others-shared-with')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res %o', res.status);
    expect(res.status).toBe(401); // not 404 implied
  });
  it('/shared-users/share-with endpoint should exist and be restricted', async () => {
    const res = await supertest(app.connection.server)
      .get('/shared-users/share-with')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res %o', res.status);
    expect(res.status).toBe(401); // not 404 implied
  });
});
