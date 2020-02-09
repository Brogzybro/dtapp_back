const mongoose = require('mongoose');
const WithingsJob = require('./withings');

const mongoTestConfig = require('../config').mongo_test;
const app = require('../App')(mongoTestConfig);
let server;

beforeAll(done => {
  server = app.listen(done);
  // console.log('withings test js listening on ' + server.address().port);
});

afterAll(done => {
  server.close(done);
});

beforeAll(async () => {
  await mongoose.connect(mongoTestConfig.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
});

it('withings job testsync', async () => {
  await WithingsJob();
});
