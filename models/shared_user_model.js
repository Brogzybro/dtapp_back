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

SharedUser.methods.shareWith = async function(otherUser) {
  this.shared_with.push(otherUser);
  await this.save();
};

module.exports = mongoose.model('SharedUser', SharedUser);
