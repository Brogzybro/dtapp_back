// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('../_helpers/jobstestlib');
const logger = require('../../config').winston.loggers.defaultLogger;
const supertest = require('supertest');
const mockData = require('../superagent-mock-data');
const { Helpers } = require('../_helpers/apphelpers');
const app = new testlib.AppTester();

beforeEach(async () => {
  await app.setup();
});

afterEach(async () => {
  await app.cleanup();
});

it('Should fail for user not shared with', async done => {
  const userThatShares = await testlib.addMockUserAndSyncMockData();
  userThatShares.fitbit = { accessToken: mockData.validAccessToken };
  await userThatShares.save();
  const userThatRequestsObj = {
    username: mockData.mockUser.username + '2',
    password: mockData.mockUser.password,
    birthDate: new Date(1995, 11, 17)
  };
  await Helpers.createUser(userThatRequestsObj);
  const res = await supertest(app.connection.server)
    .get('/devices')
    .query({ otherUser: userThatShares.username })
    .auth(userThatRequestsObj.username, userThatRequestsObj.password);

  expect(res.status).toBe(401);
  done();
});

it("Should get all devices from other user's test data (6 total)", async done => {
  const userThatShares = await testlib.addMockUserAndSyncMockData();
  userThatShares.fitbit = { accessToken: mockData.validAccessToken };
  await userThatShares.save();
  const userThatRequestsObj = {
    username: mockData.mockUser.username + '2',
    password: mockData.mockUser.password,
    birthDate: new Date(1995, 11, 17)
  };
  const userThatRequests = await Helpers.createUser(userThatRequestsObj);
  await Helpers.createSharedUser(userThatShares, userThatRequests);
  const res = await supertest(app.connection.server)
    .get('/devices')
    .query({ otherUser: userThatShares.username })
    .auth(userThatRequestsObj.username, userThatRequestsObj.password);

  expect(res.body.length).toBe(6); // 5 from withings, 1 from fitbit
  done();
});

it('Should get all devices from test data (6 total)', async done => {
  const user = await testlib.addMockUserAndSyncMockData();
  user.fitbit = { accessToken: mockData.validAccessToken };
  await user.save();
  const res = await supertest(app.connection.server)
    .get('/devices')
    .auth(mockData.mockUser.username, mockData.mockUser.password);

  logger.info('status: %o, body: %o', res.status, res.body);
  expect(res.body.length).toBe(6); // 5 from withings, 1 from fitbit
  done();
});
