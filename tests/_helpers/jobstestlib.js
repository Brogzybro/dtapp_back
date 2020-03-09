const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const request = require('superagent');
const superagentMockConfig = require('./../superagent-mock-config');
let superagentMock;
const loggers = require('../../config').winston.loggers;
const withingsLogger = loggers.withings;

exports.setupApp = async () => {
  this.disableLog('info');
  this.disableLog('log');
  this.setupDisableLogsWinston();
  this.setupMock();
  return mongod.getConnectionString(true);
};

exports.setup = async (
  disableWinston = true,
  setupMock = true,
  disableDb = true
) => {
  if (disableWinston) this.setupDisableLogsWinston();
  if (setupMock) this.setupMock();
  if (disableDb) await this.setupDb();
};

exports.after = async () => {
  this.disableMock();
  await this.disableDb();
};

exports.setupDb = async () => {
  const uri = await mongod.getConnectionString(true);

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
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
  Object.values(loggers).forEach(logger => (logger.silent = true));
  // withingsLogger.silent = true;
};

exports.disableMock = () => {
  superagentMock.unset();
};

exports.disableLog = level => {
  jest.spyOn(console, level).mockImplementation(() => {});
};

exports.enableWinstonLogs = () => {
  Object.values(loggers).forEach(logger => (logger.silent = false));
  // withingsLogger.silent = false;
};

exports.logLevel = level => {
  withingsLogger.transports.forEach(transport => {
    transport.level = level;
  });
};

exports.enableStandardLogs = () => {
  jest.clearAllMocks();
};
