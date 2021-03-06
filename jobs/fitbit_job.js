const User = require('../models/user_model');
const Sample = require('../models/sample_model');
const FitbitClient = require('../lib/fitbit_client_lib');
const { DateTime } = require('luxon');
const logger = require('../config').winston.loggers.fitbitLogger;

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
    identifier: 'stepCount',
    granularity: '1min',
    prune: true
  }
};

async function syncActivity(endpoint, activity, user, client) {
  const { identifier, granularity, prune } = activity;

  let now = DateTime.local();

  let end = now.endOf('minute');
  let start = now
    .minus({ days: 1 })
    .plus({ minutes: 1 })
    .startOf('minute');

  const latest = await Sample.findLatest({
    user: user.id,
    type: identifier,
    source: 'fitbit'
  });

  if (latest) {
    let last = DateTime.fromJSDate(latest.startDate).startOf('minute');
    start = DateTime.max(start, last);
  }

  const results = await client.activityTimeSeries(
    endpoint,
    start,
    end,
    granularity
  );
  const { dataset } = results[`activities-${endpoint}-intraday`];
  let samples = [];

  for (let { time, value } of dataset) {
    const { timezone } = user.fitbit;
    const [hour, minute, second] = time.split(':');
    const millisecond = 0;

    // Set date and time according to the user's timezone.
    // Can break in spectacular ways if user changes timezone between syncs.
    let date = end.setZone(timezone).set({ hour, minute, second, millisecond });

    // Set correct date in case data spans two dates
    if (date > end) {
      date = start.setZone(timezone).set({ hour, minute, second, millisecond });
    }

    // Don't save duplicates
    if (latest && date <= latest.endDate) {
      continue;
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
  return samples.length;
}

async function syncSleep(user, client) {
  const { timezone } = user.fitbit;
  let from = DateTime.local().minus({ weeks: 1 });

  const latest = await Sample.findLatest({
    user: user.id,
    type: 'sleep',
    source: 'fitbit'
  });

  if (latest) {
    const last = DateTime.fromJSDate(latest.startDate);
    from = DateTime.max(from, last);
  }

  const samples = [];
  const result = await client.sleep(from);

  // Retry later if pending
  if (result.meta && result.meta.state === 'pending') {
    return;
  }

  for (let log of result.sleep) {
    let startDate = DateTime.fromISO(log.startTime, { zone: timezone });
    let endDate = DateTime.fromISO(log.endTime, { zone: timezone });

    // Don't store duplicates
    if (latest && endDate <= latest.endDate) continue;

    let stages = log.levels.data.map(({ dateTime, level, seconds }) => {
      let startDate = DateTime.fromISO(dateTime, { zone: timezone });
      let endDate = startDate.plus({ seconds });
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
  return samples.length;
}

async function sync() {
  logger.info('[JOB] Running...');
  const activities = Object.keys(fitbitActivities);
  let samplesAdded = 0;

  for await (const user of User.find()) {
    // Check that user actually has synced a fitbit account
    const client = new FitbitClient(user);
    if (!client.hasFitbit()) continue;

    const profile = await client.profile();
    user.fitbit.timezone = profile.user.timezone;
    // await user.save();

    for (let key of activities) {
      samplesAdded += await syncActivity(
        key,
        fitbitActivities[key],
        user,
        client
      );
    }

    samplesAdded += await syncSleep(user, client);
  }
  logger.info('[JOB] Added %d samples.', samplesAdded);
  logger.info('[JOB] Ended');
  return samplesAdded;
}

module.exports = sync;
