const supertest = require('supertest');
const User = require('../../models/user');
const configWithings = require('../../config/index').withings;
const tUtils = require('../testutils');

const mongoTestConfig = require('../../config').mongo_test;
const app = require('../../App')(mongoTestConfig);
let server;

beforeAll(done => {
  server = app.listen(done);
});

afterAll(done => {
  server.close(done);
});

const withingsTestUser = {
  username: 'withingstestuser',
  password: 'withingstestpassword'
};

describe.skip('withings tests', () => {
  beforeAll(async () => {
    let user = await User.findOne({ username: withingsTestUser.username });
    if (!user) {
      user = await tUtils.supertestCreateUser(server, withingsTestUser);
    }
    expect(user).toBeInstanceOf(Object);
  });

  it('accessing "/withings/auth" without auth credentials should deny access', async () => {
    const result = await supertest(server).get('/withings/auth');
    expect(result.status).toBe(401);
    expect(result.text).toMatch('Unauthorized');
  });

  it('accessing "withings/auth" should redirect to withings auth url', async () => {
    const result = await supertest(server)
      .get('/withings/auth')
      .auth(withingsTestUser.username, withingsTestUser.password);
    expect(result.status).toBe(302);
    expect(result.header.location).toMatch(configWithings.authURL);
  });

  it('accessing "/withings/callback" without auth credentials should deny access', async () => {
    const result = await supertest(server)
      .get('/withings/callback')
      .query({ code: 'test', state: 'test' });
    expect(result.status).toBe(401);
    expect(result.text).toMatch('Unauthorized');
  });

  it('accessing "/withings/callback" with wrong code should fail', async () => {
    const result = await supertest(server)
      .get('/withings/callback')
      .auth(withingsTestUser.username, withingsTestUser.password)
      .query({ code: 'test', state: 'test' });
    expect(result.status).toBe(400);
    expect(result.text).toMatch('Invalid authorization code');
  });

  it('accessing "/withings/callback" with no code parameter should respond with 400 and error message', async () => {
    const result = await supertest(server)
      .get('/withings/callback')
      .auth(withingsTestUser.username, withingsTestUser.password)
      .query({ state: 'test' });
    expect(result.status).toBe(400);
    expect(result.text).toMatch('Must provide authorization code');
  });
});
