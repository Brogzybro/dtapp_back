const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const Token = require('./token_model');
const { Int32 } = require('mongodb');
const logger = require('../config').winston.loggers.defaultLogger;

const CertificateUserAgreement = {
    certificateId: {
        type: String,
        required: [true, 'Certificate id is required']
    },
    userId: {
        type: String,
        required: [true, 'User id is required']
    }
}

/**
 * @type {mongoose.Model<CertificateUserAgreement>}
 */
const mod = mongoose.model('CertificateUserAgreement', CertificateUserAgreement);

module.exports = mod;