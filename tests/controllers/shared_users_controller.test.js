const testlib = require('../_helpers/jobstestlib');
const mockData = require('../superagent-mock-data');
const supertest = require('supertest');
const logger = require('../../config').winston.loggers.testLogger;

const app = new testlib.AppTester();

describe('shared user controller group', () => {
  beforeEach(async () => {
    await app.setup();
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('/shared-users/shared-with-user endpoint should exist and be restricted', async () => {
    const res = await supertest(app.connection.server)
      .get('/shared-users/shared-with-user')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res %o', res.status);
    expect(res.status).toBe(401); // not 404 implied
  });
  it('/shared-users/others-shared-with endpoint should exist and be restricted', async () => {
    const res = await supertest(app.connection.server)
      .get('/shared-users/others-shared-with')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res %o', res.status);
    expect(res.status).toBe(401); // not 404 implied
  });
  it('/shared-users/share-with endpoint should exist and be restricted', async () => {
    const res = await supertest(app.connection.server)
      .get('/shared-users/share-with')
      .auth(mockData.mockUser.username, mockData.mockUser.password);
    logger.info('res %o', res.status);
    expect(res.status).toBe(401); // not 404 implied
  });
});
