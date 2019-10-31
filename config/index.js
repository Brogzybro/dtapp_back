require('dotenv').config();
const { env } = process;

const config = {
  port: env.PORT || 3000,

  mongo: {
    uri: env.MONGO_URL,
    test_uri: env.TEST_MONGO_URL
  },

  fitbit: {
    apiURL: 'https://api.fitbit.com',
    tokenURL: 'https://api.fitbit.com/oauth2/token',
    authURL: 'https://www.fitbit.com/oauth2/authorize',
    clientID: env.FITBIT_CLIENT_ID,
    clientSecret: env.FITBIT_CLIENT_SECRET,
    scope: 'profile heartrate sleep activity',
    redirectURI: env.FITBIT_REDIRECT_URI
  },

  withings: {
    authURL: 'https://account.withings.com/oauth2_user/authorize2',
    clientID: env.WITHINGS_CLIENT_ID,
    clientSecret: env.WITHINGS_CLIENT_SECRET,
    scope: 'user.info,user.metrics',
    redirectURI: env.WITHINGS_REDIRECT_URI
  },

  apple: {
    APNKey: env.APPLE_APN_KEY,
    APNKeyID: env.APPLE_APN_KEY_ID,
    teamID: env.APPLE_TEAM_ID,
    bundleID: env.APPLE_BUNDLE_ID
  }
};

module.exports = config;
