const Certificate = require('../models/certificate_model');
const SampleModel = require('../models/sample_model');
const UserAgreement = require('../models/certificate_user_agreement_model');
const UserModel = require('../models/user_model');
const logger = require('../config').winston.loggers.defaultLogger;
const { query } = require('winston');

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

exports.getAllApprovedCerts = async ctx => {
    const approvedCerts = await Certificate.find({ approved: true }).catch(err => {
        logger.error("error getting all approved Certificates", err);
        ctx.status = 400;
    });
    if (approvedCerts) {
        ctx.status = 200;
        ctx.body = approvedCerts;
    }
}

exports.getAllDisapprovedCerts = async ctx => {
    const disapprovedCerts = await Certificate.find({ approved: false }).catch(err => {
        logger.error("error getting all disapproved Certificates", err);
        ctx.status = 400;
    });
    if (disapprovedCerts) {
        ctx.status = 200;
        ctx.body = disapprovedCerts;
    }
}

exports.getData = async ctx => {  //TODO: find samples of type in certificate for all users that have agreed on the certificate, ALSO ADD TIME INTERVAL
    var certificateId = ctx.query.certificateKey;
    var returnList = [];

    const certificate = await Certificate.findOne({ _id: certificateId }).catch(err => {
        if (err) {
            logger.info("No certification found for id: " + certificateId);
            ctx.status = 400;
            return;
        }
    });
    if (certificate) {
        var types = certificate.dataTypes;
        logger.info("Certificate.approved: " + certificate.approved);
        if (certificate.approved === false) { // Certificate has not been approved by an admin
            logger.info("Certificate: " + certificateId + " is not approved.");
            ctx.status = 201;
            return;
        }
        logger.info(certificate);

        const users = await UserAgreement.find({ certificateId: certificateId });
        if (users) {
            var listOfUsers = [];
            var returnSamples = [];
            users.forEach(agreement => {
                listOfUsers.push(JSON.stringify(agreement.userId));
            });
            logger.info(listOfUsers);

            if (types.indexOf("age") > -1) { // if the Certificate asks for users age, add {UserId, age} to returnList
                returnAge = await getListOfUsersAge(users);
                if (returnAge) {
                    returnAge.forEach(obj => {
                        returnList.push(obj);
                    });
                }
            }
            const samplesQuery = SampleModel.find({ type: { $in: types } });
            if (ctx.query.fromDate && ctx.query.toDate) {
                let from = ctx.query.fromDate;
                let to = ctx.query.toDate;
                samplesQuery.where('created').gte(new Date(from));
                samplesQuery.where('created').lte(new Date(to));
            }
            samples = await samplesQuery.catch(errr => { // Gets all samples of the Types in types
                logger.error(errr);
            });

            if (samples) {
                samples.forEach(sample => {
                    if (listOfUsers.indexOf(JSON.stringify(sample.user)) > -1) { // if the sample is from an agreed User it gets added to returnSamples list
                        returnSamples.push(sample);
                    }
                });
                logger.info("Found: " + samples.length + " and " + returnSamples.length + " samples from agreed users samples for certificateId: " + certificateId);
                returnSamples.forEach(obj => {
                    returnList.push(obj); //adds all samples to return in returnList
                });
            }


            ctx.body = returnList; // set returnList as response
            ctx.status = 200;
            return;
        }

    }

    async function getListOfUsersAge(usersAgreements) {
        var returnUserAge = [];
        let userIds = [];
        usersAgreements.forEach(agreement => {
            userIds.push(agreement.userId);
        })
        const users = await UserModel.find({ _id: { $in: userIds } }).catch(errr => {
            if (errr) {
                logger.error("Coudlnt find user with age", errr);
            }
        });
        if (users) {
            users.forEach(user => {
                let userBirthDate = user.birthDate;
                let userId = user._id;
                let now = new Date();
                const age = Math.floor((now - userBirthDate) / 31557600000);
                var ageObject = { userId: userId, age: age };
                returnUserAge.push(ageObject);
            });
        }
        return returnUserAge
    }
}


