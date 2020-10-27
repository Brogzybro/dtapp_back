// eslint-disable-next-line no-unused-vars
const http = require('http');
const testlib = require('../_helpers/jobstestlib');
const logger = require('../../config').winston.loggers.testLogger;
// eslint-disable-next-line no-unused-vars
const Agenda = require('agenda');
const supertest = require('supertest');
const User = require('../../models/user_model');
const WithingsToken = require('../../models/withings_token_model');

// eslint-disable-next-line no-unused-vars
const PredictionController = require('../../controllers/prediction_controller');
const { Helpers } = require('../_helpers/apphelpers');

const app = new testlib.AppTester();

const withingsTestUser = {
    username: 'withingstestuser',
    password: 'withingstestpassword',
    birthDate: new Date(1995, 11, 17)
};

const user2Obj = {
    username: withingsTestUser.username + '2',
    password: withingsTestUser.password,
    birthDate: new Date(1995, 11, 17)
};

describe('prediction controller group', () => {
    beforeEach(async () => {
        await app.setup();
    });

    afterEach(async () => {
        await app.cleanup();
    });


    it('Should return a prediction', async done => {
        await Helpers.createUserWithWithingsToken(withingsTestUser);
        await Helpers.allSyncjobs();
        const res = await supertest(app.connection.server)
            .get('/prediction')
            .auth(withingsTestUser.username, withingsTestUser.password);

        logger.info('#samples = %d', res.body.length);
        expect(res.status).toBe(200); // IDK, cant find any systolicBP data for withingsTestUser

        // logger.info('status: %o, body: %o', res.status, res.body);
        done();
    });
});
