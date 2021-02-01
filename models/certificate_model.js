const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const Token = require('./token_model');
const { Int32 } = require('mongodb');
const logger = require('../config').winston.loggers.defaultLogger;

const CertificateObj = {
    approved: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    password: String,
    description: {
        type: String,
        required: [true, 'Desctiption is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    nameOfApplier: {
        type: String,
        required: [true, 'Name of applier is required'],
    },
    reasonsForDataNeed: {
        type: String,
        required: [true, 'Reasons to fetch different data is required'],
    },
    age: Boolean,
    diastolicBloodPressure: Boolean,
    systolicBloodPressure: Boolean,
    heartRate: Boolean,
    distance: Boolean,
    elevation: Boolean,
    stepCount: Boolean,
    sleep: Boolean,
    ecg: Boolean,
    wieght: Boolean,
    fatFreeMass: Boolean,
    fatRatio: Boolean,
    fatMassWeight: Boolean,
    bodyTemp: Boolean,
    muscleMass: Boolean,
    boneMass: Boolean,
    pulseWaveVelocity: Boolean

};


/**
 * @type {mongoose.Model<Certificate>}
 */
const mod = mongoose.model('Certificate', CertificateObj);

module.exports = mod;