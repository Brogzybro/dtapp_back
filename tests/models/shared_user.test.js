const testlib = require('../_helpers/jobstestlib');
const SharedUser = require('../../models/shared_user_model');
const logger = require('../../config').winston.loggers.default;

describe('shared user', () => {
  beforeEach(async done => {
    // setup memory db and stuff
    await testlib.setup();
    done();
  });
  afterEach(async done => {
    // cleanup db and stuff
    await testlib.after();
    done();
  });
  it('should be empty and throws no errors', async done => {
    // do something
    const sharedUsers = await SharedUser.find();
    expect(sharedUsers.length).toBe(0);
    done();
  });
  it('should create a bunch of sharedusers', async done => {
    // do something
    testlib.enableWinstonLogs();
    try {
      await SharedUser.create().catch(e => logger.info(e));
      await SharedUser.create({});
      await SharedUser.create();
      await SharedUser.create();
      await SharedUser.create();
    } catch (error) {
      logger.info('trycatch fail %o', error);
    }
    const sharedUsers = await SharedUser.find();
    logger.info('sharedusers: %o', sharedUsers);
    expect(sharedUsers.length).toBe(0);
    done();
  });
});
