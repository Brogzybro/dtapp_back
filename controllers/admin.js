/* eslint-disable no-multi-str */
const Sample = require('../models/Sample');

const commands = {
  fitbitsync: () => require('../jobs/fitbit')(),
  withingssync: () => require('../jobs/withings')(),
  withingswipebp: async () => {
    await Sample.deleteMany({
      type: { $in: ['systolicBloodPressure', 'diastolicBloodPressure'] }
    });
  },
  withingswipeheart: async () => {
    await Sample.deleteMany({
      type: 'ecg'
    });
  },
  withingswipesleep: async () => {
    await Sample.deleteMany({
      type: 'sleep',
      source: 'withings'
    });
  },
  test: async () => {
    console.log('test admin command');
  }
};

exports.adminCommand = async ctx => {
  ctx.status = 200;
  if (ctx.query && ctx.query.action) {
    const command = commands[ctx.query.action];
    if (command) command();
    else ctx.body = 'Unknown command';
  } else {
    let scriptStr = '';
    let htmlStr = '';
    for (let cmd in commands) {
      scriptStr += 'function myFunc' + cmd + "(){fetch('?action=" + cmd + "')}";
      htmlStr +=
        '<button onclick="myFunc' +
        cmd +
        '()">Run ' +
        cmd +
        '</button><br><br>';
    }

    ctx.body = '<script>' + scriptStr + '</script><h1>Commands</h1>' + htmlStr;
  }
};
