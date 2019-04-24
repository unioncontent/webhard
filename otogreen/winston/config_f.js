const winston = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');
require('date-utils');
const logDir = 'log';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = winston.createLogger({
  // format: winston.format.combine(
  //     winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  //     winston.format.json()
  // ),
  // transports: [
  //   new (winston.transports.Console)({
  //     timestamp: tsFormat,
  //     level: 'info'
  //   }),
  //   new (winston.transports.File)({
  //     level: 'info',
  //     filename: 'C:/overware/overwareMail/logs/console.log',
  //     timestamp: tsFormat,
  //     maxsize:52428800
  //   })
  // ]
  level: 'info',
  transports: [
    new winston.transports.DailyRotateFile({
        filename: 'C:/gitProject/webhard/otogreen/log/console.log',
        zippedArchive: true, // 압축여부
        format: winston.format.printf(info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
    }),
    // 콘솔 출력
    new winston.transports.Console({
        format: winston.format.printf(info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
    })
  ]
});
module.exports = logger;