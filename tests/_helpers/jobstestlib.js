const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const request = require('superagent');
const superagentMockConfig = require('./../superagent-mock-config');

let superagentMock;

exports.setupAll = async (
  disableWinston = true,
  setupMock = true,
  disableDb = true
) => {
  if (disableWinston) this.setupDisableLogsWinston();
  if (setupMock) this.setupMock();
  if (disableDb) await this.setupDb();
};

exports.afterAll = async () => {
  this.disableMock();
  await this.disableDb();
};

exports.setupDb = async () => {
  const uri = await mongod.getConnectionString(true);

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  await mongoose.connect(uri, mongooseOpts);
};

exports.disableDb = async () => {
  await mongoose.disconnect();
};

exports.setupMock = () => {
  superagentMock = require('superagent-mock')(
    request,
    superagentMockConfig.config
  );
};

exports.setupDisableLogsWinston = () => {
  process.env.DISABLE_ALL_LOGGERS = 'true';
};

exports.disableMock = () => {
  superagentMock.unset();
};

exports.disableLog = level => {
  jest.spyOn(console, level).mockImplementation(() => {});
};

exports.enableWinstonLogs = () => {
  process.env.DISABLE_ALL_LOGGERS = 'false';
};

exports.enableStandardLogs = () => {
  jest.clearAllMocks();
};
