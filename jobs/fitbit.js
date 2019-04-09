const User = require('../models/User');
const Sample = require('../models/Sample');
const fitbit = require('../lib/fitbit');
const format = require('dateformat');
const ms = require('ms');

const fitbitActivities = {
  heart: {
    identifier: 'heartRate',
    granularity: '1sec',
    prune: false
  },
  distance: {
    identifier: 'distance',
    granularity: '1min',
    prune: true
  },
  elevation: {
    identifier: 'elevation',
    granularity: '1min',
    prune: true
  },
  steps: {
    identifier: 'steps',
    granularity: '1min',
    prune: true
  }
};

async function syncActivity(endpoint, activity) {
  const { identifier, granularity, prune } = activity;

  for await (const user of User.find()) {
    let start;
    let end = new Date();
    const last = await Sample
      .findOne()
      .where('user').eq(user.id)
      .where('type').eq(identifier)
      .where('source').eq('fitbit')
      .sort({ startDate: -1 });

    // Limit to 23 hours ago to account for time ambiguity in API response
    // TODO: Make multiple API requests instead
    if (last && end.valueOf() - last.startDate.valueOf() < ms('23h')) {
      start = new Date(last.startDate);
    } else {
      // Last 23 hours
      start = new Date(end.valueOf() - ms('23h'));
    }

    // Fitbit API only has minute granularity
    start.setSeconds(0);
    start.setMilliseconds(0);

    // Make sure all returned values are included in the range
    end.setMinutes(end.getMinutes() + 1);
    end.setSeconds(0);
    end.setMilliseconds(0);

    const results = await fitbit.activityTimeSeries(endpoint, user, start, end, granularity);
    const dataset = results[`activities-${endpoint}-intraday`].dataset;
    const samples = [];

    for (let { time, value } of dataset) {
      const date = new Date(`${format(end, 'yyyy-mm-dd')} ${time}`);

      // Set correct date in case data spans two days
      // TODO: Account for user's UTC offset
      if (date > end) {
        date.setDate(start.getDate());
      }

      // Skip useless values
      if (prune && value === 0) {
        continue;
      }

      const sample = new Sample({
        user,
        value,
        startDate: date,
        endDate: date,
        type: identifier,
        source: 'fitbit'
      });

      samples.push(sample);
    }

    await Sample.insertMany(samples);
  }
}

async function syncSleep() {
  for await (const user of User.find()) {
    let now = Date.now();
    let from;

    const last = await Sample
      .findOne()
      .where('user').eq(user.id)
      .where('type').eq('sleep')
      .where('source').eq('fitbit')
      .sort({ startDate: -1 });

    if (last && now - last.startDate.valueOf() < ms('1w')) {
      from = last.startDate;
    } else {
      from = new Date(now - ms('1y'));
    }

    const samples = [];
    const result = await fitbit.sleep(user, from);

    // Retry later if pending
    if (result.meta && result.meta.state === 'pending') {
      return;
    }

    for (let log of result.sleep) {
      let startDate = new Date(log.startTime);
      let endDate = new Date(log.endTime);

      let stages = log.levels.data.map(({ dateTime, level, seconds }) => {
        let startDate = new Date(dateTime);
        let endDate = new Date(startDate.valueOf() + seconds * 1000);
        return { startDate, endDate, level };
      });

      const sample = new Sample({
        user,
        type: 'sleep',
        value: log.duration,
        startDate,
        endDate,
        metadata: { stages },
        source: 'fitbit'
      });

      samples.push(sample);
    }

    await Sample.insertMany(samples);
  }
}

async function sync() {
  const activities = Object.keys(fitbitActivities);

  for (let key of activities) {
    await syncActivity(key, fitbitActivities[key]);
  }

  await syncSleep();
}

module.exports = sync;
