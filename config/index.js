require('dotenv').config();
const { env } = process;

const config = {
  port: env.port || 3000,

  mongo: {
    uri: env.MONGO_URL
  },

  fitbit: {
    apiURL: 'https://api.fitbit.com',
    tokenURL: 'https://api.fitbit.com/oauth2/token',
    authURL: 'https://www.fitbit.com/oauth2/authorize',
    clientID: env.FITBIT_CLIENT_ID,
    clientSecret: env.FITBIT_CLIENT_SECRET,
    scope: 'profile heartrate sleep activity',
    redirectURI: env.FITBIT_REDIRECT_URI
  }
};

module.exports = config;
