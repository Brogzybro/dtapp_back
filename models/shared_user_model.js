const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const SharedUser = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'Must belong to a user'],
    unique: true
  },
  shared_with: [ObjectId], // Implicity defaults to []
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SharedUser', SharedUser);
