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

it('should fail with 400 (bad request) when sharing with user that does not exist', async () => {
  const userThatShares = await Helpers.createUser(mockData.mockUser);
  logger.info('userThatShares %o', userThatShares);
  const res = await supertest(app.connection.server)
    .get('/shared-users/share-with?user=aaaaaaaaaaaaaaaaaaaaaaaa')
    .auth(mockData.mockUser.username, mockData.mockUser.password);

  expect(res.status).toBe(400);
});
it('should fail with 400 (bad request) when not sending a user', async () => {
  await Helpers.createUser(mockData.mockUser);
  const res = await supertest(app.connection.server)
    .get('/shared-users/share-with')
    .auth(mockData.mockUser.username, mockData.mockUser.password);

  expect(res.status).toBe(400);
});

it('should fail with 422 for user already shared with', async () => {
  const userThatShares = await Helpers.createUser(mockData.mockUser);
  const userToShareWith = await Helpers.createUser({
    username: mockData.mockUser.username + '2',
    password: mockData.mockUser.password
  });
  await supertest(app.connection.server)
    .get('/shared-users/share-with')
    .query({ otherUser: userToShareWith.id })
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  const res = await supertest(app.connection.server)
    .get('/shared-users/share-with')
    .query({ otherUser: userToShareWith.id })
    .auth(mockData.mockUser.username, mockData.mockUser.password);

  expect(res.status).toBe(422);
});

it('should succeed with 201 when sharing with a valid user', async () => {
  const userThatShares = await Helpers.createUser(mockData.mockUser);
  logger.info('userThatShares %o', userThatShares);
  const userToShareWith = await Helpers.createUser({
    username: mockData.mockUser.username + '2',
    password: mockData.mockUser.password
  });
  const res = await supertest(app.connection.server)
    .get('/shared-users/share-with')
    .query({ otherUser: userToShareWith.id })
    .auth(mockData.mockUser.username, mockData.mockUser.password);

  expect(res.status).toBe(201);
});

it('endpoint should exist and be restricted', async () => {
  const res = await supertest(app.connection.server)
    .get('/shared-users/share-with')
    .auth(mockData.mockUser.username, mockData.mockUser.password);
  logger.info('res %o', res.status);
  expect(res.status).toBe(401); // not 404 implied
});
