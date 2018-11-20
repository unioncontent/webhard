var  express = require('express');
var  path = require('path');
var  favicon = require('serve-favicon');
var  logger = require('morgan');
var  expressLayouts = require('express-ejs-layouts');
var  cookieParser = require('cookie-parser');
var  session = require('express-session');
var  passport = require('passport');
var  flash = require('connect-flash');
var  bodyParser = require('body-parser');

var  app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ejs-layouts setting
app.set('layout', 'layout/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

/* set middlewares */
app.use(expressLayouts);
app.use(favicon(path.join(__dirname, 'public/images/favicon', 'favicon.ico')));// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));

//로그인
app.use(session({
  secret: '1@%24^%$3^*&98&^%$', // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
  resave: false, //세션 아이디를 접속할때마다 새롭게 발급하지 않음
  saveUninitialized: true, //세션 아이디를 실제 사용하기전에는 발급하지 않음
  cookie: {
    maxAge: 1000 * 60 * (60*3) // 쿠키 유효기간 3시간
  }
}));
app.use(flash()); // flash message
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(__dirname + '/www')); // redirect root

// 대시보드 & 로그인
app.use(function(req, res, next) {
  res.locals.user = res.user;
  if(req.user){
    res.locals.userSite = req.user.site;
    res.locals.userLogo = req.user.U_logo;
    res.locals.userNAME = req.user.U_name;
    res.locals.userCLASS = req.user.U_class;
    res.locals.userID = req.user.U_id;
    global.osp = res.locals.userID.replace('_admin','');
    if(res.locals.userID == "test"){
      res.locals.userSite = "test";
      global.osp = "fileham";
    }
  }
  next();
});
//대시보드
var dashBoard = require('./routes/dashBoard');
app.use('/', dashBoard);
app.use('/login', dashBoard);

/* mcp routes */
// 콘텐츠
var cnt = require('./routes/mcp/contents');
app.use('/cnts', cnt);
// 키워드
var kwd = require('./routes/mcp/keyword');
app.use('/kwd', kwd);

// 모니터링현황
var monitoring = require('./routes/mcp/monitoring');
app.use('/monitoring', monitoring);

// 통계
var statistics = require('./routes/mcp/statistics');
app.use('/statistics', statistics);

// OSP사현황,CP사현황
var setting = require('./routes/mcp/setting');
app.use('/setting', setting);

// 공지사항
var notice = require('./routes/mcp/notice');
app.use('/notice', notice);

/* osp routes */
//엑셀
var excel = require('./routes/osp/excel');
// 통계
var period = require('./routes/osp/period');
// 콘텐츠
var contents = require('./routes/osp/contents');
// 키워드
var keyword = require('./routes/osp/keyword');
// 필터링현황
var filtering = require('./routes/osp/filtering');
// 수동처리
var manual = require('./routes/osp/manual');
// 거래처
var user = require('./routes/osp/user');
// 딜레이
var delay = require('./routes/osp/delay');

app.use('/excel', excel);
app.use('/period', period);
app.use('/contents', contents);
app.use('/keyword', keyword);
app.use('/filtering', filtering);
app.use('/manual', manual);
app.use('/user', user);
app.use('/delay', delay);

/* set error */
app.use(function(req, res, next) {
  // catch 404 and forward to error handler
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
