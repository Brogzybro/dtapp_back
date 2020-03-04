const mongoose = require('mongoose');
const request = require('superagent');
const Config = require('../config').withings;
const logger = require('../config').winston.loggers.withings;
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const WithingsToken = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'Withings token must belong to a user'],
    unique: true
  },
  data: {
    type: {
      access_token: { type: String },
      expires_in: { type: Number },
      token_type: { type: String },
      scope: { type: String },
      refresh_token: { type: String },
      userid: { type: String }
    },
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

WithingsToken.methods.refresh = async function() {
  const { clientID, clientSecret, tokenURL } = Config;
  const queries = {
    grant_type: 'refresh_token',
    client_id: clientID,
    client_secret: clientSecret,
    refresh_token: this.data.refresh_token
  };

  try {
    const res = await request
      .post(tokenURL)
      .type('form')
      .send(queries);
    if (!res.text) throw new Error('res.text missing in refreshUserToken');
    /*
    logger.info(
      'Refresh user token - status: %d, text: %s',
      res.status,
      res.text
    );
    */
    if (res.status === 200) {
      const data = res.body;
      logger.info(
        'New access token for user (%o): \nOld: %o\nNew: %o',
        this.user,
        this.data,
        data
      );
      this.data = data;
      await this.save();
    }
  } catch (error) {
    console.log('withings refresh token err: ' + error);
  }
};

/*
"expires_in":10800,
"token_type":"Bearer",
"scope":"user.info",
"refresh_token":"9362feb94331a4e014ed4309dd9e74c48f2aa36c",
"userid":"19662645"
*/
module.exports = mongoose.model('WithingsToken', WithingsToken);
