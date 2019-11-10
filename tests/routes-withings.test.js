const supertest = require('supertest');
const app = require('../index');
const User = require('../models/User');
const configWithings = require('../config/index').withings;

let server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

const withingsTestUser = {
  username: 'withingstestuser',
  password: 'withingstestpassword'
};

async function supertestCreateUser(user) {
  return supertest(server).post('/user').send(user);
}

describe('withings tests', () => {

  beforeAll(async() => {
    let user = await User.findOne({ username: withingsTestUser.username });
    if (!user) {
      user = await supertestCreateUser(withingsTestUser);
    }
    expect(user).toBeInstanceOf(Object);
  });

  it('acessing "/withings/auth" without auth credentials should deny access', async() => {
    const result = await supertest(server)
      .get('/withings/auth');
    expect(result.status).toBe(401);
    expect(result.text).toMatch('Unauthorized');
  });

  it('tests that auth redirects correctly', async() => {
    const result = await supertest(server)
      .get('/withings/auth')
      .auth(withingsTestUser.username, withingsTestUser.password);
    expect(result.status).toBe(302);
    expect(result.header.location).toMatch(configWithings.authURL);
  });

  it('acessing "/withings/callback" without auth credentials should deny access', async() => {
    const result = await supertest(server)
      .get('/withings/callback')
      .query({ code: 'test', state: 'test' });
    expect(result.status).toBe(401);
    expect(result.text).toMatch('Unauthorized');
  });

  it('withings wrong code should fail authrozation', async() => {
    const result = await supertest(server)
      .get('/withings/callback')
      .auth(withingsTestUser.username, withingsTestUser.password)
      .query({ code: 'test', state: 'test' });
    expect(result.status).toBe(400);
    expect(result.text).toMatch('Invalid authorization code');
  });

  it('withings with no code parameter should respond with 400 and error message', async() => {
    const result = await supertest(server)
      .get('/withings/callback')
      .auth(withingsTestUser.username, withingsTestUser.password)
      .query({ state: 'test' });
    expect(result.status).toBe(400);
    expect(result.text).toMatch('Must provide authorization code');
  });
});
