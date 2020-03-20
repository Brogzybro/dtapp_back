const testlib = require('../../_helpers/jobstestlib');
const mockData = require('../../superagent-mock-data');
const supertest = require('supertest');
const logger = require('../../../config').winston.loggers.testLogger;
const { Helpers } = require('../../_helpers/apphelpers');

const app = new testlib.AppTester();
beforeEach(async () => {
  await app.setup();
});
afterEach(async () => {
  await app.cleanup();
});

it('shared with five users should return 5 users', async () => {
  const usersObjsThatShare = Helpers.generateArray(5, i => ({
    username: mockData.mockUser.username + i,
    password: mockData.mockUser.password
  }));
  const usersThatShare = await Promise.all(
    usersObjsThatShare.map(userObj => Helpers.createUser(userObj))
  );
  const userSharedWith = await Helpers.createUser(mockData.mockUser);
  await Promise.all(
    usersThatShare.map(userThatShares => {
      Helpers.createSharedUser(userThatShares, userSharedWith);
    })
  );
  const res = await supertest(app.connection.server)
    .get('/shared-users/shared-with-user')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(5);
  const userIds = usersThatShare.map(user => user.id);
  expect(res.body.every(v => userIds.includes(v))).toBe(true);
});

it('/shared-users/shared-with-user endpoint should exist and be restricted', async () => {
  const res = await supertest(app.connection.server)
    .get('/shared-users/shared-with-user')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res %o', res.status);
  expect(res.status).toBe(401); // not 404 implied
});
