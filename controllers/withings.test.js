const mongoose = require('mongoose');
const config = require('../config').mongo_test;
const Token = require('../models/WithingsToken');
const User = require('../models/User');
const auth = require('../routes/middleware/auth');
const app = require('../index');

let server;

beforeAll(done => {
  server = app.listen(done);
  // console.log('withings test js listening on ' + server.address().port);
});

afterAll(done => {
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
  password: 'mysecretpasswoopedy'
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
  set: function(k, v) {
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
beforeAll(async () => {
  await mongoose.connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
  const token = await Token.findOne({ access_token: mockData.access_token });
  if (token) {
    await token.remove();
  }
});

test('should log in', async () => {
  await auth(mockAuthCtx, () => {});
  // console.log(mockAuthCtx);
  expect(true).toBeTruthy();
});

test('should remove the user', async () => {
  await User.deleteOne({ username: mockUser.username });
});
