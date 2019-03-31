const User = require('../models/User');
const Sample = require('../models/Sample');
const fitbit = require('../lib/fitbit');

const fitbitActivities = {
  heart: 'heartRate',
  distance: 'distance',
  elevation: 'elevation',
  steps: 'steps'
};

async function syncActivity(activity) {
  for await (const user of User.find()) {
    let start;
    let end = new Date();
    const last = await Sample
      .where('user').eq(user.id)
      .where('type').eq(fitbitActivities[activity])
      .where('source').eq('fitbit')
      .sort({ startDate: -1 });

    if (last) {
      start = last.startDate;
    } else {
      start = new Date(end - 1000 * 60 * 20);
    }

    // TODO: do some magic if start date != end date to account for fitbit's date ambiguity

    const results = await fitbit.activityTimeSeries(activity, user, start, end);
    const dataset = results[`activities-${activity}-intraday`].dataset;
    const samples = [];

    for (let { time, value } of dataset) {
      // TODO: Use some library for this
      let [hour, minute, second] = time.split(':').map(s => parseInt(s));
      let date = new Date(start);
      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(second);

      const sample = new Sample({
        user,
        value,
        startDate: date,
        endDate: date,
        type: fitbitActivities[activity],
        source: 'fitbit'
      });

      samples.push(sample);
    }

    await Sample.insertMany(samples);
  }
};

module.exports = { syncActivity };
