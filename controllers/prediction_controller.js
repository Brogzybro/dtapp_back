const User = require('../models/user_model');
const Sample = require('../models/sample_model');
const logger = require('../config').winston.loggers.defaultLogger;
const sample = require('../controllers/samples_controller');
const user = require('../controllers/user_controller');

exports.getPrediction = async ctx => {

    //Variables from Fillips model
    let beta_0 = -15.139611;
    let beta_1 = 0.048337;
    let beta_2 = 0.055844;
    let beta_3 = 0.060932;

    const userId = ctx.state.user.id;
    const userBirthDate = ctx.state.user.birthDate;
    let now = new Date();
    const age = Math.floor((now - userBirthDate) / 31557600000);

    const latestDia = await Sample.findLatest({
        user: userId,
        type: 'diastolicBloodPressure'
    });
    const latestSys = await Sample.findLatest({
        user: userId,
        type: 'systolicBloodPressure'
    });

    const ret = { "systolic": -1, "diastolic": -1, "risk": -1 };
    if (latestDia == null || latestSys == null) {
        ctx.body = ret;
    } else {
        const z = beta_0 + age * beta_1 + latestSys.value * beta_2 + latestDia.value * beta_3;
        const risk = 1 / (1 + Math.exp(-z));
        ret.systolic = latestSys.value;
        ret.diastolic = latestDia.value;
        ret.risk = risk;
        ctx.body = ret;
    }
}