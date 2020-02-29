process.env.DISABLE_ALL_LOGGERS = 'true';
const mongoose = require('mongoose');
const request = require('superagent');
const superagentMockConfig = require('./../superagent-mock-config');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const withingsJob = require('../../jobs/withings_job');
const withingsConfig = require('../../config').withings;
const Sample = require('../../models/sample');
const Token = require('../../models/withings_token');

const { mockTokenWrongAccessToken } = require('../superagent-mock-data');

let superagentMock;

const measureEntry = {
  type: 'systolicBloodPressure',
  value: 10
};

describe('withings job tests', () => {
  beforeAll(async () => {
    process.env.DISABLE_ALL_LOGGERS = 'true';

    superagentMock = require('superagent-mock')(
      request,
      superagentMockConfig.config
    );

    const uri = await mongod.getConnectionString();

    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    await mongoose.connect(uri, mongooseOpts);
  });
  afterAll(() => {
    superagentMock.unset();
  });
  it.skip('should get a list of measures with invalid access token (uses valid refresh token)', async () => {
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
  });

  it.skip('should call sleep summary', async () => {
    await withingsJob.syncSleep(
      mockTokenWrongAccessToken.user,
      mockTokenWrongAccessToken.data.access_token,
      mockTokenWrongAccessToken.data.refresh_token
    );
  });
  it('should sync all (48) withings', async () => {
    await Token.create(mockTokenWrongAccessToken);
    await withingsJob.sync();
    const samples = await Sample.find();
    expect(samples.length).toBe(48);
  });

  it.skip('should something', async () => {
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
  });
});

// const mongoose = require('mongoose');
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
