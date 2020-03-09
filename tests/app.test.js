const appPromise = require('../App');
// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('./_helpers/jobstestlib');
const logger = require('../config').winston.loggers.default;
// eslint-disable-next-line no-unused-vars
const Agenda = require('agenda');

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
  app = await appPromise({
    uri: uri
  });
  server = await app.listen(done, true);
  // console.log('withings test js listening on ' + server.address().port);
});

afterEach(async done => {
  await testlib.after();
  server.close(done);
});

it('App should have no scheduled jobs', async () => {
  logger.info('test');
  const jobs = await app.agenda.jobs();

  expect(jobs.length).toBe(0);
  logger.info(
    'jobs %o',
    (await app.agenda.jobs()).map(job => job.attrs)
  );
});
