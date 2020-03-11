const appPromise = require('../../App');
// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('../_helpers/jobstestlib');
const logger = require('../../config').winston.loggers.defaultLogger;
const supertest = require('supertest');
const mockData = require('../superagent-mock-data');

/**
 * @type http.Server
 */
let server;

/**
 * @type AApp
 */
let app;

beforeEach(async done => {
  const uri = await testlib.setupApp();
  app = await appPromise({ uri: uri });
  server = await app.listen(done, true);
});

afterEach(async done => {
  server.close(done);
});

it('Should get all devices from test data (6 total)', async done => {
  const user = await testlib.addMockUserAndSyncMockData();
  user.fitbit = { accessToken: mockData.validAccessToken };
  await user.save();
  const res = await supertest(server)
    .get('/devices')
    .auth(mockData.mockUser.username, mockData.mockUser.password);

  logger.info('status: %o, body: %o', res.status, res.body);
  expect(res.body.length).toBe(6); // 5 from withings, 1 from fitbit
  done();
});
