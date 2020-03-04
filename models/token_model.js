const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const uuidv4 = require('uuid/v4');

const Token = new Schema({
  token: { type: String, default: uuidv4 },
  user: { type: ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '1h' }
  }
});

module.exports = mongoose.model('Token', Token);
