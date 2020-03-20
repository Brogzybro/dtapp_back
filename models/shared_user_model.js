const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const logger = require('../config').winston.loggers.defaultLogger;

const sharedUserObj = {
  user: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'Must belong to a user'],
    unique: false
  },
  shared_with: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'Must be shared with a user'],
    unique: false
  }
};
const SharedUser = new Schema(sharedUserObj);

SharedUser.index({ user: 1, shared_with: 1 }, { unique: true });

SharedUser.on('index', function(err) {
  logger.info('ayy ' + err);
});

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
