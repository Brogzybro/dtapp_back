const testlib = require('../../_helpers/jobstestlib');
const mockData = require('../../superagent-mock-data');
const supertest = require('supertest');
const logger = require('../../../config').winston.loggers.testLogger;
const { Helpers } = require('../../_helpers/apphelpers');
const SharedUser = require('../../../models/shared_user_model');

const app = new testlib.AppTester();
beforeEach(async () => {
  await app.setup();
});
afterEach(async () => {
  await app.cleanup();
});

it('should remove user shared with', async () => {
  const userThatShares = await Helpers.createUser(mockData.mockUser);
  const usersObjsToShareWith = Helpers.generateArray(5, i => ({
    username: mockData.mockUser.username + i,
    password: mockData.mockUser.password,
    birthDate: new Date(1995, 11, 17)
  }));
  const usersToShareWith = await Promise.all(
    usersObjsToShareWith.map(userObj => Helpers.createUser(userObj))
  );
  await Promise.all(
    usersToShareWith.map(userToShareWith =>
      userThatShares.shareWith(userToShareWith)
    )
  );
  expect((await SharedUser.find({ user: userThatShares })).length).toEqual(5);
  const res = await supertest(app.connection.server)
    .delete('/shared-users')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res status: %o body: %o', res.status, res.body);
  expect(res.status).toBe(200);
  expect(await SharedUser.find({ user: userThatShares })).toEqual([]);
});

it('endpoint should exist and be restricted', async () => {
  const res = await supertest(app.connection.server)
    .delete('/shared-users')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res %o', res.status);
  expect(res.status).toBe(401); // not 404 implied
});
