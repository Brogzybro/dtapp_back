const testlib = require('../_helpers/jobstestlib');
const SharedUser = require('../../models/shared_user_model');
const logger = require('../../config').winston.loggers.defaultLogger;
const { Helpers } = require('../_helpers/apphelpers');
const { mockUser } = require('../superagent-mock-data');

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

describe('shared user', () => {
  it('should create multiple shared user entries for a user', async done => {
    // do something
    const userThatShares = await Helpers.createUser(mockUser);
    const usersObjsToShareWith = [...Array(5)].map((_, i) => ({
      username: mockUser.username + i,
      password: mockUser.password,
      birthDate: new Date(1995, 11, 17)
    }));
    const usersToShareWith = await Promise.all(
      usersObjsToShareWith.map(async userObj => Helpers.createUser(userObj))
    );
    await Promise.all(
      usersToShareWith.map(userToShareWith => {
        return SharedUser.create({
          user: userThatShares,
          shared_with: userToShareWith
        });
      })
    );
    done();
  });
  it('should fail with missing user', async done => {
    // do something
    const userToShareWith = await Helpers.createUser(mockUser);
    let sharedUser = null;
    try {
      sharedUser = await SharedUser.create({
        shared_with: userToShareWith
      });
    } catch (error) { }
    expect(sharedUser).toBeNull();
    done();
  });

  it('should fail with missing shared_with', async done => {
    // do something
    const userThatShares = await Helpers.createUser(mockUser);
    let sharedUser = null;
    try {
      sharedUser = await SharedUser.create({
        user: userThatShares
      });
    } catch (error) { }
    expect(sharedUser).toBeNull();
    done();
  });

  it('should create a shared user entry without error', async done => {
    // do something
    const userThatShares = await Helpers.createUser(mockUser);
    const userToShareWith = await Helpers.createUser({
      username: mockUser.username + '2',
      password: mockUser.password,
      birthDate: new Date(1995, 11, 17)
    });
    await SharedUser.create({
      user: userThatShares,
      shared_with: userToShareWith
    });
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
