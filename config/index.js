require('dotenv').config();
const { env } = process;

const config = {
  mongo: {
    uri: env.MONGO_URI
  },

  fitbit: {
    apiURL: 'https://api.fitbit.com',
    tokenURL: 'https://api.fitbit.com/oauth2/token',
    authURL: 'https://www.fitbit.com/oauth2/authorize',
    clientID: env.FITBIT_CLIENT_ID,
    clientSecret: env.FITBIT_CLIENT_SECRET,
    scope: 'profile heartrate sleep activity',
    redirectURI: 'http://localhost:3000/fitbit/callback'
  }
};

module.exports = config;
