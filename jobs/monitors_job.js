const { DateTime } = require('luxon');
const notification = require('../lib/notification');

const User = require('../models/user');
const Sample = require('../models/sample');

async function heartRate() {
  for await (const user of User.find()) {
    const time = DateTime.local().minus({ minutes: 20 });

    const samples = await Sample.find()
      .where('user')
      .equals(user.id)
      .where('type')
      .equals('heartRate')
      .where('value')
      .lte(40)
      .where('startDate')
      .gte(time);

    if (!samples.length) continue;

    await notification(
      user,
      'Heart Rate Alert!',
      'Your heart rate dropped below 40 bpm during the last 20 minutes.'
    );
  }
}

module.exports = { heartRate };
