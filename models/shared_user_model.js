const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const sharedUserObj = {
  user: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'Must belong to a user']
  },
  shared_with: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'Must be shared with a user']
  },
  timestamp: { type: Date, default: Date.now }
};
const SharedUser = new Schema(sharedUserObj);

SharedUser.index({ user: 1, shared_with: 1 }, { unique: true });

// SharedUser.methods.shareWith = async function(otherUser) {
//   this.shared_with.push(otherUser);
//   await this.save();
// };

// SharedUser.methods.isSharedWith = function(otherUser) {
//   return this.shared_with.includes(otherUser.id);
// };

/**
 * @typedef SharedUser
 * @type {mongoose.Document &
 * sharedUserObj &
 * mongoose.MongooseDocumentOptionals}
 */
/**
 * @type {mongoose.Model<SharedUser, {}>
 */
module.exports = mongoose.model('SharedUser', SharedUser);
