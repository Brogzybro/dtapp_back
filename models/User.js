const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const Token = require('./token');

const User = new Schema({
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
});

// TODO: Create indexes

// Virtual attribute for plaintext password
User.virtual('password');

// Validate and hash passwords
User.pre('validate', async function() {
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
User.method('authenticate', function(password) {
  return bcrypt.compare(password, this.passwordHash);
});

// Generate temporary token
User.method('generateToken', async function() {
  const existingTokens = await Token.find({ user: this.id });
  if (existingTokens) {
    await Token.deleteMany({ user: this.id });
  }
  const token = await Token.create({ user: this.id });
  return token;
});

// Find by token
User.static('findByToken', async function(token) {
  const found = await Token.findOne({ token }).populate('user');
  if (found) return found.user;
});

module.exports = mongoose.model('User', User);
