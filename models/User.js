const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const User = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  passwordHash: String,
  fitbit: {
    userID: String,
    accessToken: String,
    refreshToken: String
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

module.exports = mongoose.model('User', User);
