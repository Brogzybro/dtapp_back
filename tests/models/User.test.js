test.todo('some test to be written in the future');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const User = require('../../models/User');

beforeAll(async () => {
  const uri = await mongod.getConnectionString();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  await mongoose.connect(uri, mongooseOpts);
});

it('should be no users', async () => {
  const user = await User.findOne();
  expect(user).toBeNull();
});
it('should be no users2', async () => {
  const user = await User.findOne();
  expect(user).toBeNull();
});
it('should be no users3', async () => {
  const user = await User.findOne();
  expect(user).toBeNull();
});
it('should be no users4', async () => {
  const user = await User.findOne();
  expect(user).toBeNull();
});
it('should be no users5', async () => {
  const user = await User.findOne();
  expect(user).toBeNull();
});
it('should be no users6', async () => {
  const user = await User.findOne();
  expect(user).toBeNull();
});

it('should add user', async () => {
  const user = new User({ username: 'blabla', password: 'yoyoyoyo' });
  let retUser = null;
  try {
    retUser = await user.save();
  } catch (error) {
    console.warn(error);
  }
  expect(retUser).toEqual(user);
});

// const User = require('../models/User');
// const ConfigMongo = require('../config').mongo_test;
// const DB = require('../db');
// const mongoose = require('mongoose');

// /**
//  * @type mongoose.Connection
//  */
// let connection;

// describe('User tests', () => {
//   beforeAll(() => {
//     mongoose.set('debug', true);
//     connection = DB.init(ConfigMongo);
//   });
//   it('user save test', async () => {
//     const user = await User.findOne();
//     let beforePass = user.passwordHash;
//     user.iOS.deviceTokens.push('yo');
//     await user.save();
//     console.log(user);
//     let afterPass = user.passwordHash;
//     expect({ beforePass, afterPass }).toBe(null);
//   });
// });
