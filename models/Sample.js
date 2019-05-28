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

Sample.static('findLatest', function(conditions) {
  return this.findOne(conditions).sort({ startDate: -1 });
});

Sample.set('toJSON', {
  transform: (doc, ret) => {
    ret.startDate = doc.startDate.valueOf();
    ret.endDate = doc.endDate.valueOf();
  }
});

module.exports = mongoose.model('Sample', Sample);
