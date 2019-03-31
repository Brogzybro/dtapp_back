const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Mixed, ObjectId } = Schema.Types;

const Sample = new Schema({
  user: { type: ObjectId, ref: 'User' },
  type: { type: String, required: true },
  value: Mixed,
  startDate: Date,
  endDate: Date,
  source: String
});

// Allow arbitrary metadata
Sample.set('strict', false);

module.exports = mongoose.model('Sample', Sample);
