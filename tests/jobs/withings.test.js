const mongoose = require('mongoose');
const request = require('superagent');
const config = require('./../superagent-mock-config');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const withingsJob = require('../../jobs/withings_job');
const withingsConfig = require('../../config').withings;
const Sample = require('../../models/sample');

const superagentMock = require('superagent-mock')(request, config);

const measureEntry = {
  type: 'systolicBloodPressure',
  value: 10
};

const mockTokenData = {
  access_token: '03db50ed52e42602ee500acc624411f17c4b0224',
  expires_in: 10800,
  token_type: 'Bearer',
  scope: 'user.info,user.metrics,user.activity',
  refresh_token: '84151dcd36100bb76605675d5416a1abbf2e17d2',
  userid: 19662645
};

const mockToken = {
  user: '5e564c0b2a2a4400171f2eee',
  data: mockTokenData
};

describe('withings job tests', () => {
  beforeAll(async () => {
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
  it('should something syncmeasure', async () => {
    const res = await withingsJob.syncMeasure(
      mockToken.user,
      measureEntry,
      mockToken.data.access_token,
      mockToken.data.refresh_token,
      withingsConfig.measureUrl
    );
    // const allSamples = await Sample.find();
    expect(Array.isArray(res)).toBe(true);
    console.info(res);
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
