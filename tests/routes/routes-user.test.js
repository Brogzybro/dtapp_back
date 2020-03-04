const supertest = require('supertest');
const User = require('../../models/user');
const tUtils = require('../testutils');

const testUser = {
  username: 'userblablablabla',
  password: 'mysecretpasswoopedy'
};

const testUser2 = {
  username: 'userbla',
  password: 'mysecretpasswoopedy'
};

const mongoTestConfig = require('../../config').mongo_test;
const appPromise = require('../../App');
let server;

beforeAll(async done => {
  const app = await appPromise(mongoTestConfig);
  server = await app.listen(done, true);
});

afterAll(async done => {
  server.close(done);
});

describe('user tests', () => {
  beforeAll(async done => {
    // Remove user before tests if it exists
    const user = await User.findOne({ username: testUser.username });
    if (user) {
      await user.remove();
    }
    const user2 = await User.findOne({ username: testUser2.username });
    if (user2) {
      await user2.remove();
    }
    await User.create(testUser2);
    done();
  });

  it('create new user', async done => {
    const result = await supertest(server)
      .post('/user')
      .send(testUser);
    expect(result.status).toEqual(201);
    done();
  });

  it('update user', async done => {
    const newUserDetails = {
      username: testUser.username,
      password: 'mynewpassword'
    };
    const result = await supertest(server)
      .patch('/user')
      .send(newUserDetails)
      .set('Authorization', tUtils.genAuthToken(testUser));
    expect(result.status).toEqual(201);
    done();
  });

  it('create user that already exists should fail', async done => {
    const result = await supertest(server)
      .post('/user')
      .send(testUser);
    expect(result.status).toEqual(422);
    done();
  });

  it('update user to name that already exists should fail', async done => {
    const newUserDetails = {
      username: testUser.username,
      password: testUser2.password
    };
    const result = await supertest(server)
      .patch('/user')
      .send(newUserDetails)
      .set('Authorization', tUtils.genAuthToken(testUser2));
    expect(result.status).toEqual(422);
    done();
  });
});
