const Sample = require('../models/Sample');

exports.adminCommand = async ctx => {
  ctx.status = 200;
  if (ctx.query && ctx.query.action) {
    switch (ctx.query.action) {
      case 'fitbitsync':
        require('../jobs/fitbit')();
        break;
      case 'withingssync':
        require('../jobs/withings')();
        break;
      case 'withingswipebp':
        await Sample.deleteMany({
          type: { $in: ['systolicBloodPressure', 'diastolicBloodPressure'] }
        });
        break;
      case 'withingswipeheart':
        await Sample.deleteMany({
          type: 'ecg'
        });
        break;
      default:
        console.log('Unrecognized admin command');
        break;
    }
  }
};
