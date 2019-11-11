const supertest = require('supertest');

exports.supertestCreateUser = async (server, user) => {
  return supertest(server)
    .post('/user')
    .send(user);
};

exports.genAuthToken = user => {
  return (
    'Basic ' +
    Buffer.from(user.username + ':' + user.password).toString('base64')
  );
};
