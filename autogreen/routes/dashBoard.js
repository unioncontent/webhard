const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var LocalStrategy = require('passport-local').Strategy;

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('dashBoard');
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
    var user = results[0];
    if (err) {
      return done(err);
    }
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
  req.logout();
  res.redirect('/');
});

module.exports = router;
