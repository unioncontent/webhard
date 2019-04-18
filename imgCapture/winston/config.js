// const appRoot = require('app-root-path');
const winston = require('winston');
// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: `D:/otogreen/server/log/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 52428800,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};
// instantiate a new Winston Logger with the settings defined above
const tsFormat = () => (new Date()).toLocaleTimeString();
let logger;
if (process.env.logging === 'off') {
  logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.json()
    ),
    transports: [
      new (winston.transports.Console)({
        timestamp: tsFormat,
        level: 'info'
      }),
      new winston.transports.File(options.file),
    ],
    exitOnError: false, // do not exit on handled exceptions
  });
} else {
  logger = winston.createLogger({
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console(options.console),
    ],
    exitOnError: false, // do not exit on handled exceptions
  });
}

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write(message) {
    logger.info(message.replace(/\u001b\[[0-9]{1,2}m/g, ''));
  },
};
module.exports = logger;
