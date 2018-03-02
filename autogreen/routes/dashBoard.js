var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var DashBoard = require('../models/dashBoard.js');
var LocalStrategy = require('passport-local').Strategy;

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  DashBoard.getAllDataCount('',function(err,result){
    var data = {
      totalCount: 0,
      TCount: 0,
      DCount: 0,
      PCount: 0
    };
    if(result){
      data['totalCount'] = result[0].total;
      data['TCount'] = result[0].tTotal;
      data['DCount'] = result[0].dTotal;
      data['PCount'] = result[0].pTotal;
    }
    res.render('dashBoard',data);
  });
});

router.post('/getCPList', function(req, res, next) {
  User.getClassList('c',function(err,result){
    if(err){
      res.status(500).send('다시 시도해주세요.');
      return false;
    }
    res.send(result);
  });
});

router.post('/get24DataList', function(req, res, next) {
  DashBoard.get24DataList(function(err,result){
    if(err){
      res.status(500).send('다시 시도해주세요.');
      return false;
    }
    res.send(result);
  });
});

router.post('/getCPCcountList', function(req, res, next) {
  DashBoard.getAllDataCount(req.body.cp,function(err,result){
    if(err){
      console.log(err);
      res.status(500).send('다시 시도해주세요.');
      return false;
    }
    var data = null;
    if(result.length > 0){
      data = result[0]
    }
    console.log(data);
    res.send(data);
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {layout: false});
});

/* set passport*/
passport.serializeUser(function(user, done) {
  done(null, user.U_id);
});

passport.deserializeUser(function(id, done) {
  /* db 에서 id를 이용하여 user를 얻어서 done을 호출합니다 */
  User.checkId(id, function(err, results) {
    var user = results[0];
    user.U_pw = bcrypt.hashSync(user.U_pw)
    done(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function(username, password, done) {
  User.checkId(username, function(err, results) {
    if (err) {
      return done(err);
    }
    var user = results[0];
    if (!user) {
      return done(null, false, { message: '아이디가 맞지 않습니다.' });
    }
    if (user.U_pw !== password) {
      return done(null, false, { message: '비밀번호가 맞지 않습니다.' });
    }
    return done(null, user);
  });
}));

router.post('/login',passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', function (req, res){
  delete global.name;
  req.logout();
  res.redirect('/');
});

module.exports = router;
