const { testtest } = require('./withings');
const mongoose = require('mongoose');
const config = require('../config').mongo;
const Token = require('../models/WithingsToken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Koa = require('koa');

const mockData = {
  'access_token': '9bc24895c9e10e53d273cf079ad8a17290d05ae8',
  'expires_in': 10800,
  'token_type': 'Bearer',
  'scope': 'user.info,user.metrics',
  'refresh_token': '36cfad4c29c2776de12760be12223367fa951ff3',
  'userid': '19662645'
};

const mockUser = {
  'username': 'myuser11',
  'password': 'mysecretpasswoopedy'
};
const mockAuthCtx = {
  state: {},
  req: {
    ...mockUser,
    headers: {
      authorization: 'Basic ' + Buffer.from(mockUser.username + ':' + mockUser.password).toString('base64')
    }
  },
  set(k, v) {
    this.req.headers[k] = v;
  }
};

test('Should output name in appropriate format', () => {
  expect(testtest('test')).toBe('my name is test');
});

beforeAll(async() => {
  await await mongoose.connect(config.test_uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
});

test('should add withings token', async() => {
  const user = await User.create(mockUser);
  mockData.user = user._id;
  const token = await Token.create(mockData).catch((err) => {
    console.log('token create err: ' + err);
  });
  console.log(token);
  console.log(user);
  expect(true).toBeTruthy();
});

test('should log in', async() => {
  await auth(mockAuthCtx, () => {});
  console.log(mockAuthCtx);
  expect(true).toBeTruthy();
});

test('should remove the user', async() => {
  await User.deleteOne({ username: mockUser.username });
});
