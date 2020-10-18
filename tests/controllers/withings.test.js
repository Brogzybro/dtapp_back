const mongoose = require('mongoose');
const Token = require('../../models/withings_token_model');
const User = require('../../models/user_model');
const auth = require('../../routes/middleware/auth');

const mongoTestConfig = require('../../config').mongo_test;
const { getApp: appPromise } = require('../../App');
// eslint-disable-next-line no-unused-vars
const http = require('http');

/**
 * @type http.Server
 */
let server;

beforeAll(async done => {
  const app = await appPromise(mongoTestConfig);
  server = await app.listen(done, true);
  // console.log('withings test js listening on ' + server.address().port);
});

afterAll(async done => {
  server.close(done);
});

const mockData = {
  access_token: '9bc24895c9e10e53d273cf079ad8a17290d05ae8',
  expires_in: 10800,
  token_type: 'Bearer',
  scope: 'user.info,user.metrics',
  refresh_token: '36cfad4c29c2776de12760be12223367fa951ff3',
  userid: '19662645'
};

const mockUser = {
  username: 'myuser11',
  password: 'mysecretpasswoopedy',
  birthDate: new Date(1995, 11, 17)
};
const mockAuthCtx = {
  state: {},
  req: {
    ...mockUser,
    headers: {
      authorization:
        'Basic ' +
        Buffer.from(mockUser.username + ':' + mockUser.password).toString(
          'base64'
        )
    }
  },
  set: function (k, v) {
    this.req.headers[k] = v;
  }
};

/*
const mockWithingsCallbackCTX = {
  query: {
    code: 'test',
    state: 'teststate'
  },
  state: {
    mockUser
  }
};
*/
// test
beforeAll(async done => {
  await mongoose.connect(mongoTestConfig.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
  const token = await Token.findOne({ access_token: mockData.access_token });
  if (token) {
    await token.remove();
  }
  done();
});

test.skip('should log in', async done => {
  await auth(mockAuthCtx, () => { });
  // console.log(mockAuthCtx);
  expect(true).toBeTruthy();
  done();
});

test.skip('should remove the user', async done => {
  await User.deleteOne({ username: mockUser.username });
  done();
});
