const mongoTestConfig = require('../config').mongo_test;
require('../db').init(mongoTestConfig);
const fitbitSync = require('../jobs/fitbit');

it('should sync fitbit without errors', async () => {
  await fitbitSync();
  //
});
