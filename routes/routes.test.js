const supertest = require('supertest');
const app = require('../index');
const User = require('../models/User');

let server;

beforeAll(() => {
  server = app.listen(3001);
});

const testUser = {
  username: 'userblablablabla',
  password: 'mysecretpasswoopedy'
};

const testUser2 = {
  username: 'userbla',
  password: 'mysecretpasswoopedy'
};

function genAuthToken(user) {
  return 'Basic ' + Buffer.from(user.username + ':' + user.password).toString('base64');
}

describe('tests', () => {
  beforeAll(async() => {
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
  });

  it('create new user', async() => {
    const result = await supertest(server).post('/user').send(testUser);
    expect(result.status).toEqual(201);
  });

  it('update user', async() => {
    const newUserDetails = {
      username: testUser.username,
      password: 'mynewpassword'
    };
    const result = await supertest(server)
      .patch('/user')
      .send(newUserDetails)
      .set('Authorization', genAuthToken(testUser));
    expect(result.status).toEqual(201);
  });

  it('create user that already exists should fail', async() => {
    const result = await supertest(server).post('/user').send(testUser);
    expect(result.status).toEqual(422);
  });

  it('update user to name that already exists should fail', async() => {
    const newUserDetails = {
      username: testUser.username,
      password: testUser2.password
    };
    const result = await supertest(server)
      .patch('/user')
      .send(newUserDetails)
      .set('Authorization', genAuthToken(testUser2));
    expect(result.status).toEqual(422);
  });
});
