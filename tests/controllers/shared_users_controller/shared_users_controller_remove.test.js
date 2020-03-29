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

it('should remove user shared with', async () => {
  const userThatShares = await Helpers.createUser(mockData.mockUser);
  const userToShareWith = await Helpers.createUser({
    username: mockData.mockUser.username + '2',
    password: mockData.mockUser.password
  });
  await userThatShares.shareWith(userToShareWith);
  const res = await supertest(app.connection.server)
    .delete('/shared-users/' + userToShareWith.username)
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  const res2 = await supertest(app.connection.server)
    .delete('/shared-users/' + userToShareWith.username)
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res status: %o body: %o', res.status, res.body);
  expect(res.status).toBe(200); // not 404 implied
});

it('endpoint should exist and be restricted', async () => {
  const res = await supertest(app.connection.server)
    .delete('/shared-users/username')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res %o', res.status);
  expect(res.status).toBe(401); // not 404 implied
});
