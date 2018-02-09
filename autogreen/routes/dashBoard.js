var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var connection = mysql.createConnection(require('../db/db_con.js'));
var router = express.Router();

connection.connect((err) => {
    if(err) {
      console.log(err);
      return;
    }
    console.log( 'mysql connect completed' );
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  // res.render('dashBoard',{
  //   userNAME: req.user.U_name,
  //   userID: req.user.U_id
  // });
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
  connection.query('SELECT * from user_all_b where U_id=?', [id], function(err, rows) {
    var user = rows[0];
    user.U_pw = bcrypt.hashSync(user.U_pw)
    done(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function(username, password, done) {
  connection.query('SELECT * from user_all_b where U_id=?', [username], function(err, rows) {
    var user = rows[0];
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
