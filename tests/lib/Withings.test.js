const Withings = require('../../lib/withings');
const User = require('../../models/user');
const configMongo = require('../../config').mongo_test;
require('../../db').init(configMongo);

const mockConfig = {
  withings: {
    authURL: 'https://my.example.com/authorize',
    clientID: '5555',
    clientSecret: 'mysecret',
    scope: 'user.info,user.metrics',
    redirectURI: 'https://my.redirect.com/callback'
  }
};

const mockUser = {
  username: 'WithingsNewTokenUser',
  password: 'WithingsNewTokenUserPassword'
};

const mockTokenData = {
  access_token: '9bc24895c9e10e53d273cf079ad8a17290d05ae8',
  expires_in: 10800,
  token_type: 'Bearer',
  scope: 'user.info,user.metrics',
  refresh_token: '36cfad4c29c2776de12760be12223367fa951ff3',
  userid: '19662645'
};

describe('Withings functions', () => {
  it('authurl has proper form', () => {
    const result = Withings.authURL('state', mockConfig.withings);
    expect(result.href).toMatch(
      'https://my.example.com/authorize?response_type=code&client_id=5555&scope=user.info%2Cuser.metrics&redirect_uri=https%3A%2F%2Fmy.redirect.com%2Fcallback&state=state'
    );
  });

  it('newtoken without active user (no _userid) should fail', async done => {
    const result = await Withings.newToken(mockUser, mockTokenData);
    expect(result).toBe(false);
    done();
  });

  it('newtoken with active user should succeed', async done => {
    let user = await User.findOne({ username: mockUser.username });
    if (!user) {
      user = await User.create(mockUser);
    }
    const result = await Withings.newToken(user, mockTokenData);
    expect(result._id).toBeTruthy();

    // result.remove().exec();

    // TODO: fix this test
    done();
  }, 10000);
});
