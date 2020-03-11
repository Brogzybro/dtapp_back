const testlib = require('../_helpers/jobstestlib');
const FitbitClient = require('../../lib/fitbit_client_lib');
const User = require('../../models/user_model');
const MockData = require('../superagent-mock-data');
const logger = require('../../config').winston.loggers.defaultLogger;

describe('fitbit lib group', () => {
  beforeEach(() => {
    // setup memory db and stuff
    testlib.setup();
  });
  afterEach(() => {
    // cleanup db and stuff
    testlib.after();
  });
  it('fitbit lib test', async done => {
    // do something
    // testlib.enableWinstonLogs();
    let user = User.create(MockData.mockUser);
    user.fitbit = { accessToken: MockData.validAccessToken };
    const client = new FitbitClient(user);
    const res = await client.getDevices();
    logger.info('return %o', res);
    done();
  });
});
