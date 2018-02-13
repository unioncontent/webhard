var  express = require('express');
var  path = require('path');
var  favicon = require('serve-favicon');
var  logger = require('morgan');
var  expressLayouts = require('express-ejs-layouts');
var  cookieParser = require('cookie-parser');
var  session = require('express-session');
var  passport = require('passport');
var  flash = require('connect-flash'); // use passport flash message
var  bodyParser = require('body-parser');

var  app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ejs-layouts setting
app.set('layout', 'layout/layout');
app.set('layout extractScripts', true);

/* set middlewares */
app.use(expressLayouts);
app.use(favicon(path.join(__dirname, 'public/assets/images/favicon', 'favicon.ico')));// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: '1@%24^%$3^*&98&^%$', // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
  resave: false, //세션 아이디를 접속할때마다 새롭게 발급하지 않음
  saveUninitialized: true, //세션 아이디를 실제 사용하기전에는 발급하지 않음
  cookie: {
    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
  }
}));
app.use(flash()); // flash message
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/sweetalert/dist')); // redirect sweetalert
app.use('/js', express.static(__dirname + '/node_modules/raphael')); // redirect raphael
app.use('/js', express.static(__dirname + '/node_modules/morris.js')); // redirect morris
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/bootstrap-daterangepicker')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/components-jqueryui')); // redirect jquery-ui JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js')); // redirect JS tether
app.use('/js', express.static(__dirname + '/node_modules/jquery-slimscroll')); // redirect JS jquery-slimscroll
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap-daterangepicker')); // redirect CSS bootstrap-daterangepicker

/* set router */
// 대시보드 & 로그인
app.use(function(req, res, next) {
  res.locals.user = res.user;
  if(req.user){
    res.locals.userNAME = req.user.U_name;
    res.locals.userCLASS = req.user.U_class;
    res.locals.userID = req.user.U_id;
  }
  else {
    res.locals.userNAME = undefined;
    res.locals.userID = undefined;
    res.locals.userCLASS = undefined;
  }
  next();
});

var dashBoard = require('./routes/dashBoard');
app.use('/', dashBoard);
app.use('/login', dashBoard);

// 통계
var period = require('./routes/period');
app.use('/period', period);

// 콘텐츠
var contents = require('./routes/contents');
app.use('/contents', contents);
app.use('/contents/add', contents);
app.use('/keyword', contents);

// 필터링현황
var filtering = require('./routes/filtering');
app.use('/filtering', filtering);

// 수동처리
var manual = require('./routes/manual');
app.use('/manual', manual);

// 거래처
var user = require('./routes/user');
app.use('/user', user);
app.use('/user/add', user);

/* set error */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
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
