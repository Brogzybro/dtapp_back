const appPromise = require('../../App');
// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('../_helpers/jobstestlib');
const logger = require('../../config').winston.loggers.default;
// eslint-disable-next-line no-unused-vars
const Agenda = require('agenda');
const supertest = require('supertest');
const User = require('../../models/user_model');
const WithingsJob = require('../../jobs/withings_job');
const mockData = require('../superagent-mock-data');
const WithingsToken = require('../../models/withings_token_model');
const FitbitJob = require('../../jobs/fitbit_job');

/**
 * @type http.Server
 */
let server;

/**
 * @type AApp
 */
let app;

const withingsTestUser = {
  username: 'withingstestuser',
  password: 'withingstestpassword'
};

beforeEach(async done => {
  const uri = await testlib.setupApp();
  app = await appPromise({ uri: uri });
  server = await app.listen(done, true);
  // console.log('withings test js listening on ' + server.address().port);
});

afterEach(async done => {
  server.close(done);
});

it('Should only get samples from fitbit sources', async done => {
  const user = await User.create(withingsTestUser);
  await WithingsToken.create({
    user: user,
    data: mockData.mockTokenValidAccessToken.data
  });
  await WithingsJob.sync();
  await FitbitJob();
  const res = await supertest(server)
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
