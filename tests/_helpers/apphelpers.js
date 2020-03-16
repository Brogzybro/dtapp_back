const WithingsJob = require('../../jobs/withings_job');
const FitbitJob = require('../../jobs/fitbit_job');
const User = require('../../models/user_model');
const mockData = require('../superagent-mock-data');
const WithingsToken = require('../../models/withings_token_model');

class Helpers {
  static async createUserWithWithingsToken(userObject) {
    const user = await User.create(userObject);
    await WithingsToken.create({
      user: user,
      data: mockData.mockTokenValidAccessToken.data
    });
    return user;
  }

  static async allSyncjobs() {
    let samplesAdded = 0;
    samplesAdded += await WithingsJob.sync();
    samplesAdded += await FitbitJob();
    return samplesAdded;
  }
}

module.exports.Helpers = Helpers;
