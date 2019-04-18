// "start": "forever start -c 'node --max_old_space_size=8192' -l D:/otogreen/server/otogreen_img.log -a --minUptime 500 --spinSleepTime 200 www.js"

const http = require('http');
const hostname = '192.168.1.15';
var fs = require('fs');
var path = require('path');
var express = require('express');   // express 모듈
var bodyParser = require('body-parser');
var cors = require('cors')();
const logger = require('morgan');
const winston = require('./winston/config');
var app = express();
var debug = require('debug')('autogreen:server');
app.use(logger('dev', { stream: winston.stream}));
// app.use(logger('common', {stream: fs.createWriteStream('./logs/access.log', {flags: 'a'})}))
// app.set('port',3000);

// var server = http.createServer(app);           //서버 객체를 얻어옴

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '8000mb'}));
app.use(bodyParser.urlencoded({limit: '8000mb', extended: true}));

app.use(cors);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// 콘텐츠
var cnt = require('./routes/contents');
app.use('/cnts', cnt);

// 모니터링 현황
var monitoring = require('./routes/monitoring');
app.use('/monitoring', monitoring);

// 이미지 작업
var img = require('./routes/img');
app.use('/img', img);

// server.listen(app.get('port'), function () {
//   console.log('Express server listening on port ' + app.get('port'));
// });
// server.on('listening', onListening);

// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//   debug('Listening on ' + bind);
// }



module.exports = app;

// app.use('/images', express.static(__dirname + '/public'));


// 이미지파일 호스팅 로직
// app.get('/monitoring_img/:name',function (req,res){
//     var filename = req.params.name;
//     console.log(__dirname+'/images/'+filename);
//     fs.exists(__dirname+'/images/'+filename, function (exists) {
//         if (exists) {
//             fs.readFile(__dirname+'/images/'+filename, function (err,data){
//                 res.end(data);
//             });
//         } else {
//             res.end('file is not exists');
//         }
//     })
// });
