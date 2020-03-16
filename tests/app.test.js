// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('./_helpers/jobstestlib');
const logger = require('../config').winston.loggers.defaultLogger;
// eslint-disable-next-line no-unused-vars
const Agenda = require('agenda');

/**
 * @type testlib.ConnectionData
 */
let connection;

beforeEach(async done => {
  connection = await testlib.setupApp();
  done();
});

afterEach(async () => {
  await testlib.after();
  await testlib.afterApp(connection);
});

it.skip('App should have no scheduled jobs', async () => {
  logger.info('test');
  const jobs = await connection.app.agenda.jobs();

  expect(jobs.length).toBe(0);
  logger.info(
    'jobs %o',
    (await connection.app.agenda.jobs()).map(job => job.attrs)
  );
});
