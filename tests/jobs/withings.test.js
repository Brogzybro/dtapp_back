// process.env.DISABLE_ALL_LOGGERS = 'true';
const request = require('superagent');
const withingsJob = require('../../jobs/withings_job');
const Sample = require('../../models/sample_model');
const WithingsToken = require('../../models/withings_token_model');
const testlib = require('../_helpers/jobstestlib');
const withingsLogger = require('../../config').winston.loggers.withingsLogger;

const { mockTokenWrongAccessToken } = require('../superagent-mock-data');

const measureEntry = {
  type: 'systolicBloodPressure',
  value: 10
};

describe('withings job tests', () => {
  beforeEach(async done => {
    await testlib.setup();
    testlib.disableLog('log');
    testlib.disableLog('info');
    done();
  });
  afterEach(async done => {
    await testlib.after();
    done();
  });
  it('should get a list of measures with invalid access token (uses valid refresh token)', async done => {
    const res = await withingsJob.syncMeasure(
      mockTokenWrongAccessToken,
      measureEntry
    );
    // const allSamples = await Sample.find();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length > 0);
    console.info(res);
    withingsLogger.info('test');
    done();
  });

  it('should call sleep summary', async done => {
    const token = WithingsToken(mockTokenWrongAccessToken);
    const spyRefresh = jest.spyOn(token, 'refresh');
    await withingsJob.syncSleep(token);
    expect(spyRefresh).toHaveBeenCalledTimes(1);
    done();
  });
  it('should sync all (48) withings', async done => {
    await WithingsToken.create(mockTokenWrongAccessToken);
    await withingsJob.sync(); //
    const samples = await Sample.find();
    expect(samples.length).toBe(236);
    done();
  });

  it.skip('should something', async done => {
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
