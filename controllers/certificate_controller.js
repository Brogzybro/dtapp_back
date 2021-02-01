const Certificate = require('../models/certificate_model');
const SampleModel = require('../models/sample_model');
const logger = require('../config').winston.loggers.defaultLogger;

exports.create = async ctx => {
    var requestBody = ctx.request.body;
    requestBody.approved = 0;

    const createdCertificate = await Certificate.create(requestBody).catch(err => {
        if (err && err.code === 11000) {
            ctx.status = 422;
            ctx.body = 'User already exists';
        } else if (err) {
            console.log(err);
            ctx.status = 400;
        }
    });
    if (createdCertificate) {
        ctx.status = 201;
        ctx.body = createdCertificate.id;
    }
}
exports.approveCert = async ctx => {
    var certificateId = ctx.query.certificateKey;
    const certUpdated = await Certificate.updateOne({ _id: certificateId }, { approved: true }).catch(err => {
        if (err) {
            logger.error(err);
            ctx.status = 400;
        }
    });
    if (certUpdated) {
        logger.info(certificateId + " is approved!");
        ctx.status = 200;
    }
}

exports.disapproveCert = async ctx => {
    var certificateId = ctx.query.certificateKey;
    const certUpdated = await Certificate.updateOne({ _id: certificateId }, { approved: false }).catch(err => {
        if (err) {
            logger.error(err);
            ctx.status = 400;
        }
    });
    if (certUpdated) {
        logger.info(certificateId + " is disapproved!");
        ctx.status = 200;
    }
}

exports.getData = async ctx => {  //TODO: find samples of type in certificate for all users that have agreed on the certificate, ALSO ADD TIME INTERVAL
    var certificateId = ctx.query.certificateKey;

    Certificate.find({ _id: certificateId }).exec(
        function (err, certificate) {
            if (certificate.approved == false) { //Certificate has not been approved by an admin
                ctx.status = 401;
            }
            logger.info(certificate);
            var types = ['weight', 'diastolicBloodPressure', 'systolicBloodPressure']

            SampleModel.find({ type: { $in: types } }).exec(
                function (errr, samples) {
                    logger.info(samples);
                }
            )
        }
    );
}


