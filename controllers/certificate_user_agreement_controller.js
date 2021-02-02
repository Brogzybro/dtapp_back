const Certificate = require('../models/certificate_model');
const User = require('../models/user_model');
const Agreement = require('../models/certificate_user_agreement_model');
const logger = require('../config').winston.loggers.defaultLogger;

exports.create = async ctx => {
    logger.info(" trying to create an agreement.");
    const certId = ctx.query.certificateKey;
    const userId = ctx.state.user.id;
    logger.info("certId: " + certId + ", userId: " + userId);

    let isUnique = await agreementUnique(certId, userId);
    if (!isUnique) {
        logger.info("agreement alredy exists!");
        ctx.status = 422;
        ctx.body = 'Agreement already exists';
        return;
    }

    const agreement = await Agreement.create({ certificateId: certId, userId: userId }).catch(err => {
        if (err) {
            logger.error(err);
            ctx.status = 400;
        }
    });
    if (agreement) {
        ctx.status = 200;
        ctx.body = agreement;
        logger.info("agreement made for user: " + userId + " on cert: " + certId);
    }
}

exports.delete = async ctx => {
    const certId = ctx.query.certificateKey;
    const userId = ctx.state.user.id;
    const agreement = await Agreement.deleteOne({ certificateId: certId, userId: userId }).catch(err => {
        if (err) {
            logger.error(err);
            ctx.status = 400;
        }
    });
    if (agreement) {
        ctx.status = 200;
        ctx.body = agreement;
        logger.info("agreement deleted for user: " + userId + " on cert: " + certId);
    }
}

async function agreementUnique(certId, userId) {
    let agreement = await Agreement.find({ certificateId: certId, userId: userId }).catch(err => {
        logger.error("Looking for unique Agreements. ", err);
    });
    if (agreement.length == 0) {
        return true;
    } else {
        return false;
    }
}