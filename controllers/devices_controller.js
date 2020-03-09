const logger = require('../config').winston.loggers.default;
const WithingsLib = require('../lib/withings_lib');
const FitbitClient = require('../lib/fitbit_client_lib');

/**
 * Device data.
 * @typedef {Object<string, any>} GeneralDeviceInfo
 * @property {string} type
 * @property {string} battery
 * @property {string} model
 * @property {string} source
 */

exports.list = async ctx => {
  const { user } = ctx.state;

  const client = new FitbitClient(user);

  /**
   * @type {[GeneralDeviceInfo]}
   */
  const devices = [
    ...(await WithingsLib.getDevices(user)).map(device => ({
      type: device.type,
      battery: device.battery,
      model: device.model,
      source: device.source
    })),
    ...(await client.getDevices()).map(device => ({
      type: device.type,
      battery: device.battery.toLowerCase(),
      model: device.deviceVersion,
      source: device.source
    }))
  ];

  logger.info('Devices request from user %o', user);

  ctx.body = devices;
};
