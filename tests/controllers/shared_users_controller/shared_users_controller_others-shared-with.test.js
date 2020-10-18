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
  const usersObjsToShareWith = Helpers.generateArray(5, i => ({
    username: mockData.mockUser.username + i,
    password: mockData.mockUser.password,
    birthDate: new Date(1995, 11, 17)
  }));
  const usersToShareWith = await Promise.all(
    usersObjsToShareWith.map(userObj => Helpers.createUser(userObj))
  );
  const userThatShares = await Helpers.createUser(mockData.mockUser);
  await Helpers.createSharedUserMultiple(userThatShares, usersToShareWith);
  const res = await supertest(app.connection.server)
    .get('/shared-users/others-shared-with')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(5);
  const usernames = usersToShareWith.map(user => user.username);
  expect(res.body.every(v => usernames.includes(v))).toBe(true);
});

it('with no shared users returns empty array', async () => {
  await Helpers.createUser(mockData.mockUser);
  const res = await supertest(app.connection.server)
    .get('/shared-users/others-shared-with')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res status %o, body %o', res.status, res.body);
  expect(res.body.length).toBe(0);
  // expect([401, 404]).not.toContain(res.status);
});

it('/shared-users/others-shared-with endpoint should exist and be restricted', async () => {
  const res = await supertest(app.connection.server)
    .get('/shared-users/others-shared-with')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res %o', res.status);
  expect(res.status).toBe(401); // not 404 implied
});
