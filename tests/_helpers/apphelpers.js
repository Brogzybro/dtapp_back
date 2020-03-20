const WithingsJob = require('../../jobs/withings_job');
const FitbitJob = require('../../jobs/fitbit_job');
const User = require('../../models/user_model');
/** @typedef {import('../../models/user_model').User} User */
const mockData = require('../superagent-mock-data');
const WithingsToken = require('../../models/withings_token_model');
const SharedUser = require('../../models/shared_user_model');

class Helpers {
  /** @param {Object} userObject */
  static async createUser(userObject) {
    return User.create(userObject);
  }

  /**
   * @param {User} userThatShares
   * @param {User} userToShareWith
   */
  static async createSharedUser(userThatShares, userToShareWith) {
    return SharedUser.create({
      user: userThatShares,
      shared_with: userToShareWith
    });
  }

  /**
   * @param {User} userThatShares
   * @param {User[]} usersToShareWith
   */
  static async createSharedUserMultiple(userThatShares, usersToShareWith = []) {
    return Promise.all(
      usersToShareWith.map(userToShareWith => {
        this.createSharedUser(userThatShares, userToShareWith);
      })
    );
  }

  /** @param {Object} userObject */
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

  /**
   * @param {Number} numElements
   * @param {function(Number):void} callback (index)=>{}
   */
  static generateArray(numElements, callback) {
    return [...Array(5)].map((_, i) => callback(i));
  }
}

module.exports.Helpers = Helpers;
