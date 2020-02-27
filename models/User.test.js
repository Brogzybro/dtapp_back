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

test.todo('some test to be written in the future');
