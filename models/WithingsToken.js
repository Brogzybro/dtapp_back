const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const Token = new Schema({
  access_token: { type: String },
  user: { type: ObjectId, ref: 'User' },
  expires_in: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  refresh_token: { type: String },
  userid: { type: String }
});

/*
"expires_in":10800,
"token_type":"Bearer",
"scope":"user.info",
"refresh_token":"9362feb94331a4e014ed4309dd9e74c48f2aa36c",
"userid":"19662645"
*/
module.exports = mongoose.model('WithingsTokens', Token);
