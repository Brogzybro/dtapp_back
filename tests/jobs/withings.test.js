var request = require('superagent');
var config = require('./../superagent-mock-config');
const WithingsJob = require('../../jobs/withings_job');

var superagentMock = require('superagent-mock')(request, config);

describe('withings job tests', () => {
  it.skip('should ', async () => {
    await WithingsJob();
  });
});

superagentMock.unset();
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
