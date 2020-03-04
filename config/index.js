require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const winston = require('winston');
const loggerUtil = require('../util/loggerUtil');

const { env } = process;

const config = {
  port: env.PORT || 3000,
  admin_pass: env.ADMIN_PASS,

  mongo: {
    uri: env.MONGO_URL
  },

  mongo_test: {
    uri: env.TEST_MONGO_URL
  },

  fitbit: {
    apiURL: 'https://api.fitbit.com',
    tokenURL: 'https://api.fitbit.com/oauth2/token',
    tokenStateURL: 'https://api.fitbit.com/1.1/oauth2/introspect',
    authURL: 'https://www.fitbit.com/oauth2/authorize',
    clientID: env.FITBIT_CLIENT_ID,
    clientSecret: env.FITBIT_CLIENT_SECRET,
    scope: 'profile heartrate sleep activity',
    redirectURI: env.FITBIT_REDIRECT_URI
  },

  withings: {
    authURL: 'https://account.withings.com/oauth2_user/authorize2',
    tokenURL: 'https://account.withings.com/oauth2/token',
    measureUrl: 'https://wbsapi.withings.net/measure',
    getDeviceURL: 'https://wbsapi.withings.net/v2/user?action=getdevice',
    heartGetURL: 'https://wbsapi.withings.net/v2/heart?action=get',
    heartListURL: 'https://wbsapi.withings.net/v2/heart?action=list',
    sleepSummaryURL: 'https://wbsapi.withings.net/v2/sleep?action=getsummary',
    clientID: env.WITHINGS_CLIENT_ID,
    clientSecret: env.WITHINGS_CLIENT_SECRET,
    scope: 'user.info,user.metrics,user.activity',
    redirectURI: env.WITHINGS_REDIRECT_URI
  },

  apple: {
    APNKey: env.APPLE_APN_KEY,
    APNKeyID: env.APPLE_APN_KEY_ID,
    teamID: env.APPLE_TEAM_ID,
    bundleID: env.APPLE_BUNDLE_ID
  },

  winston: {
    loggers: {
      /**
       * @type winston.Logger
       */
      withings: (() => {
        if (global.withingsLogger) {
          return global.withingsLogger;
        }
        global.withingsLogger = loggerUtil.basicLogger(
          'withings.log',
          'Withings'
        );
        return global.withingsLogger;
      })(),
      /**
       * @type winston.Logger
       */
      fitbit: (() => {
        if (global.fitbitLogger) {
          return global.fitbitLogger;
        }
        global.fitbitLogger = loggerUtil.basicLogger('fitbit.log', 'Fitbit');
        return global.fitbitLogger;
      })(),
      /**
       * @type winston.Logger
       */
      default: (() => {
        if (global.generalLogger) {
          return global.generalLogger;
        }
        global.generalLogger = loggerUtil.basicLogger('general.log', 'General');
        return global.generalLogger;
      })()
    }
  }
};

module.exports = config;
