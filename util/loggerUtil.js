const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.splat(),
  winston.format.printf((info, opts) => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
  })
);

function createLogger(fileName, format) {
  return winston.createLogger({
    levels: {
      error: 0,
      warn: 1,
      test: 2,
      info: 3,
      verbose: 4,
      debug: 5
    },
    transports: [
      new winston.transports.Console({
        format: format,
        level: 'info'
      }),
      new winston.transports.File({
        filename: fileName,
        format: format,
        level: 'debug',
        silent: process.env.NODE_ENV === 'test'
      })
    ]
  });
}

exports.basicLogger = (fileName, label) =>
  createLogger(
    fileName,
    winston.format.combine(winston.format.label({ label: label }), logFormat)
  );
