const testlib = require('../_helpers/jobstestlib');
const WithingsLib = require('../../lib/withings_lib');
const User = require('../../models/user_model');
const MockData = require('../superagent-mock-data');
const WithingsToken = require('../../models/withings_token_model');

describe('withings lib group', () => {
  beforeEach(() => {
    // setup memory db and stuff
    testlib.setup();
  });
  afterEach(() => {
    // cleanup db and stuff
    testlib.after();
  });
  it('withings lib test', async done => {
    // do something
    const userInstance = await User.create(MockData.mockUser);
    await WithingsToken.create({
      user: userInstance,
      data: MockData.mockTokenValidAccessToken.data
    });
    await WithingsLib.getDevices(userInstance);
    done();
  });
});
