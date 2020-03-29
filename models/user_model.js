const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const Token = require('./token_model');
const SharedUser = require('./shared_user_model');
const logger = require('../config').winston.loggers.defaultLogger;

const UserObj = {
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true
  },
  passwordHash: String,
  fitbit: {
    userID: String,
    accessToken: String,
    refreshToken: String,
    timezone: String
  },
  iOS: {
    deviceTokens: [String]
  }
};

const UserSchema = new Schema(UserObj);

// TODO: Create indexes

// Virtual attribute for plaintext password
UserSchema.virtual('password');

// Validate and hash passwords
UserSchema.pre('validate', async function() {
  if (!this.password) {
    if (this.isNew) this.invalidate('password', 'Password is required');
    return;
  }

  if (this.password.length < 8) {
    this.invalidate('password', 'Password must be at least 8 characters');
    return;
  }

  this.passwordHash = await bcrypt.hash(this.password, 10);
});

// Authenticate user
UserSchema.methods.authenticate = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Generate temporary token
UserSchema.methods.generateToken = async function() {
  const existingTokens = await Token.find({ user: this.id });
  if (existingTokens) {
    await Token.deleteMany({ user: this.id });
  }
  const token = await Token.create({ user: this.id });
  return token;
};

// Find by token
UserSchema.statics.findByToken = async function(token) {
  const found = await Token.findOne({ token }).populate('user');
  if (found) return found.user;
};

// const methods = {
//   isSharedWith: async function(otherUser) {
//     const sharedUsers = await SharedUser.find({ user: this.user });
//     const sharedUsersIds = sharedUsers.map(user => user.shared_with);
//     return sharedUsersIds.includes(otherUser.id);
//   }
// };

// UserSchema.methods = {
//   ...UserSchema.methods,
//   methods
// };

/**
 * @param {User} otherUser
 */
UserSchema.methods.isSharedWith = async function(otherUser) {
  return Boolean(
    await SharedUser.findOne({ user: this, shared_with: otherUser })
  );
};

/**
 * @param {User} otherUser
 * @returns {User} Returns user shared with, or null if already shared
 */
UserSchema.methods.shareWith = async function(otherUser) {
  if (await SharedUser.findOne({ user: this, shared_with: otherUser }))
    return null;
  return SharedUser.create({ user: this, shared_with: otherUser });
};

/**
 * @param {User} otherUser
 * @returns {Boolean} success
 */
UserSchema.methods.removeShare = async function(otherUser) {
  try {
    const res = await SharedUser.deleteMany({
      user: this,
      shared_with: otherUser
    });
    return true;
  } catch (error) {
    logger.info(
      'failed to remove share between users %o and %o',
      this,
      otherUser
    );
    return false;
  }
};

/**
 * @typedef User
 * @type {mongoose.Document &
 * UserObj &
 * mongoose.MongooseDocumentOptionals &
 * UserSchema.methods
 * UserSchema.statics}
 */

/**
 * @type {mongoose.Model<User, {}>
 */
module.exports = mongoose.model('User', UserSchema);
