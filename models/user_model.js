const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const Token = require('./token_model');

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
UserSchema.method('authenticate', function(password) {
  return bcrypt.compare(password, this.passwordHash);
});

// Generate temporary token
UserSchema.method('generateToken', async function() {
  const existingTokens = await Token.find({ user: this.id });
  if (existingTokens) {
    await Token.deleteMany({ user: this.id });
  }
  const token = await Token.create({ user: this.id });
  return token;
});

// Find by token
UserSchema.static('findByToken', async function(token) {
  const found = await Token.findOne({ token }).populate('user');
  if (found) return found.user;
});

/**
 * @typedef User
 * @type {mongoose.Document &
 * UserObj &
 * mongoose.MongooseDocumentOptionals}
 */
/**
 * @type {mongoose.Model<User, {}>
 */
module.exports = mongoose.model('User', UserSchema);
