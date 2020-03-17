const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const request = require('superagent');
const superagentMockConfig = require('./../superagent-mock-config');
let superagentMock;
const loggers = require('../../config').winston.loggers;
const withingsLogger = loggers.withingsLogger;
const mockData = require('../superagent-mock-data');
const User = require('../../models/user_model');
const WithingsToken = require('../../models/withings_token_model');
const WithingsJob = require('../../jobs/withings_job');
// eslint-disable-next-line no-unused-vars
const { getApp: appPromise, AApp } = require('../../App');
// eslint-disable-next-line no-unused-vars
const http = require('http');

exports.addMockUserAndSyncMockData = async () => {
  const user = await User.create(mockData.mockUser);
  await WithingsToken.create({
    user: user,
    data: mockData.mockTokenValidAccessToken.data
  });
  await WithingsJob.sync();
  return user;
};

/**
 * @typedef ConnectionData
 * @property {AApp} app the app object
 * @property {http.Server} server the server object
 */

/**
 * Used to test controllers and app
 */
module.exports.AppTester = class {
  constructor() {
    /**
     * @type {ConnectionData}
     */
    this.connection = null;
  }
  async setup() {
    exports.disableLog('info');
    exports.disableLog('log');
    exports.setupDisableLogsWinston();
    exports.setupMock();

    const uri = await mongod.getConnectionString(true);
    const app = await appPromise({ uri: uri });
    const server = app.callback(); // app.listen();
    this.connection = { app, server };
  }
  async cleanup() {
    await exports.after();
    return new Promise((resolve, reject) => {
      // this.connection.server.close(() => {
      //   resolve();
      // });
      resolve();
    });
  }
};

exports.setup = async (
  disableWinston = true,
  setupMock = true,
  disableDb = true
) => {
  this.disableLog('info');
  this.disableLog('log');
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
