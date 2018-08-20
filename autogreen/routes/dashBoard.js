var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
// DB module
var User = require('../models/osp/user.js');
var DashBoard = require('../models/dashBoard.js');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

/* GET home page. */
router.get('/',isAuthenticated,async function(req, res, next) {
  if(res.locals.userSite != "autogreen"){
    var countObj = await DashBoard.getStatistics(global.osp);
    var CPList = await DashBoard.getCPList(global.osp);
    var arr = await DashBoard.getStatistics(global.osp,CPList);
    if(countObj === false){
      res.render('osp/dashBoard',{
        count : [0,0,0,0],
        countList : []
      });
      return false;
    }
    Promise.all(arr).then(function(entry) {
      res.render('osp/dashBoard',{
        count : countObj,
        countList : entry
      });
    }).catch(function(err) {
      // dispatch a failure and throw error
      throw err;
      res.render('osp/dashBoard',{
        count : countObj,
        countList : []
      });
    });
    return false;
  }
  else{
    res.render('mcp/dashBoard');
  }
});

router.post('/get24DataList', async function(req, res, next) {
  console.log('get24DataList');
  var result = await DashBoard.get24DataList(global.osp);
  res.send(result);
});

router.get('/login', function(req, res, next) {
  res.render('login', {layout: false, message : req.flash('loginMessage')});
});

router.post('/login', function (req, res, next) {
  //  패스포트 모듈로 인증 시도
  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if('U_id' in user){
        return res.redirect('/');
      }
    });
  })(req, res, next);

});

router.get('/logout', function (req, res){
  delete global.name;
  req.logout();
  res.redirect('/');
});

/* set passport*/
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
},
async function(req, username, password, done) {
  try{
    var result = await DashBoard.checkId(username);
    if (result.length == 0) {
      return done(null, false, req.flash('loginMessage', '아이디가 존재하지 않습니다.'));
    }
    if (result[0].U_pw !== password) {
      return done(null, false, req.flash('loginMessage', '비밀번호가 맞지 않습니다.'));
    }
    return done(null, result[0]);
  }
  catch(err){
    return done(err);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = router;
