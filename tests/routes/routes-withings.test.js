const supertest = require('supertest');
const User = require('../../models/user_model');
const configWithings = require('../../config/index').withings;
const tUtils = require('../testutils');

const mongoTestConfig = require('../../config').mongo_test;
const { getApp: appPromise } = require('../../App');
let server;

beforeAll(async done => {
  const app = await appPromise(mongoTestConfig);
  server = await app.listen(done, true);
});

afterAll(async done => {
  server.close(done);
});

const withingsTestUser = {
  username: 'withingstestuser',
  password: 'withingstestpassword',
  birthDate: new Date(1995, 11, 17)
};

describe.skip('withings tests', () => {
  beforeAll(async done => {
    let user = await User.findOne({ username: withingsTestUser.username });
    if (!user) {
      user = await tUtils.supertestCreateUser(server, withingsTestUser);
    }
    expect(user).toBeInstanceOf(Object);
    done();
  });

  it('accessing "/withings/auth" without auth credentials should deny access', async done => {
    const result = await supertest(server).get('/withings/auth');
    expect(result.status).toBe(401);
    expect(result.text).toMatch('Unauthorized');
    done();
  });

  it('accessing "withings/auth" should redirect to withings auth url', async done => {
    const result = await supertest(server)
      .get('/withings/auth')
      .auth(withingsTestUser.username, withingsTestUser.password);
    expect(result.status).toBe(302);
    expect(result.header.location).toMatch(configWithings.authURL);
    done();
  });

  it('accessing "/withings/callback" without auth credentials should deny access', async done => {
    const result = await supertest(server)
      .get('/withings/callback')
      .query({ code: 'test', state: 'test' });
    expect(result.status).toBe(401);
    expect(result.text).toMatch('Unauthorized');
    done();
  });

  it('accessing "/withings/callback" with wrong code should fail', async done => {
    const result = await supertest(server)
      .get('/withings/callback')
      .auth(withingsTestUser.username, withingsTestUser.password)
      .query({ code: 'test', state: 'test' });
    expect(result.status).toBe(400);
    expect(result.text).toMatch('Invalid authorization code');
    done();
  });

  it('accessing "/withings/callback" with no code parameter should respond with 400 and error message', async done => {
    const result = await supertest(server)
      .get('/withings/callback')
      .auth(withingsTestUser.username, withingsTestUser.password)
      .query({ state: 'test' });
    expect(result.status).toBe(400);
    expect(result.text).toMatch('Must provide authorization code');
    done();
  });
});
