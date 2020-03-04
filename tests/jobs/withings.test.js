// process.env.DISABLE_ALL_LOGGERS = 'true';
const request = require('superagent');
const withingsJob = require('../../jobs/withings_job');
const withingsConfig = require('../../config').withings;
const Sample = require('../../models/sample');
const Token = require('../../models/withings_token');
const testlib = require('../_helpers/jobstestlib');

const { mockTokenWrongAccessToken } = require('../superagent-mock-data');

const measureEntry = {
  type: 'systolicBloodPressure',
  value: 10
};

describe('withings job tests', () => {
  beforeEach(async done => {
    await testlib.setupAll();
    // testlib.disableLog('log');
    // testlib.disableLog('info');
    done();
  });
  afterEach(async done => {
    await testlib.afterAll();
    done();
  });
  it('should get a list of measures with invalid access token (uses valid refresh token)', async done => {
    testlib.enableWinstonLogs();
    const res = await withingsJob.syncMeasure(
      mockTokenWrongAccessToken.user,
      measureEntry,
      mockTokenWrongAccessToken.data.access_token,
      mockTokenWrongAccessToken.data.refresh_token,
      withingsConfig.measureUrl
    );
    // const allSamples = await Sample.find();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length > 0);
    console.info(res);
    done();
  });

  it('should call sleep summary', async done => {
    await withingsJob.syncSleep(
      mockTokenWrongAccessToken.user,
      mockTokenWrongAccessToken.data.access_token,
      mockTokenWrongAccessToken.data.refresh_token
    );
    done();
  });
  it('should sync all (48) withings', async done => {
    await Token.create(mockTokenWrongAccessToken);
    await withingsJob.sync(); //
    const samples = await Sample.find();
    expect(samples.length).toBe(48);
    done();
  });

  it('should something', async done => {
    let res = null;
    try {
      const queries = {
        action: 'getmeas',
        meastype: 10
      };
      res = await request
        .get('https://wbsapi.withings.net/measure')
        .query(queries);
    } catch (error) {
      console.warn(error);
    }
    console.info(res);
    done();
  });
});

// const WithingsJob = require('./withings');

// const mongoTestConfig = require('../config').mongo_test;
// const app = require('../App')(mongoTestConfig);
// let server;

// beforeAll(done => {
//   server = app.listen(done);
//   // console.log('withings test js listening on ' + server.address().port);
// });

// afterAll(done => {
//   server.close(done);
// });

// beforeAll(async () => {
//   await mongoose.connect(mongoTestConfig.uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true
//   });
// });

// it('withings job testsync', async () => {
//   await WithingsJob();
// });

test.todo('some test to be written in the future');
