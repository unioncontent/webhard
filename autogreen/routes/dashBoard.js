var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var DashBoard = require('../models/dashBoard.js');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.user || !global.osp){
    return res.redirect('/login');
  }
  var sql = "SELECT FORMAT(COUNT(*),0) AS totalCount,\
  FORMAT(COUNT(IF(K_apply='T' and CS_state='1',1,null)),0) as TCount,\
  FORMAT(COUNT(IF(K_apply='T' and CS_state='0',1,null)),0) as TdCount,\
  FORMAT(COUNT(IF(K_apply='D' and CS_state='1',1,null)),0) as DCount,\
  FORMAT(COUNT(IF(K_apply='D' and CS_state='0',1,null)),0) as DdCount,\
  FORMAT(COUNT(IF(K_apply='P',1,null)),0) as PCount\
  FROM dashboard where date(CS_regdate)=curdate()";
  var promise = require('../db/db_promise.js');
  var DBpromise = new promise(global.osp);
  var countObj = null;
  var arr = [];
  DBpromise.query(sql).then(rows => {
    countObj = rows[0];
    var sql = 'select U_name from user_all_b where U_class=\'c\' and U_state= \'1\'';
    return DBpromise.query(sql+' order by U_name')
  })
  .then(rows => {
    sql += " and U_id_c=?";
    arr = [];
    rows.forEach(function(entry) {
      var result = DBpromise.query(sql,entry.U_name).then(rows => {
        rows[0].cp_name = entry.U_name;
        return rows[0];
      });
      arr.push(result);
    },err => {
      res.render('dashBoard',{
        count : [0,0,0,0],
        countList : []
      });
    });
    return arr;
  })
  .then(rows => {
    DBpromise.close();
    Promise.all(rows).then(data => {
      res.render('dashBoard',{
        count : countObj,
        countList : data
      });
    });
  })
  .catch(function (err) {
    DBpromise.close();
    console.log(err);
  });
});

router.post('/get24DataList', function(req, res, next) {
  console.log('get24DataList');
  DashBoard.get24DataList(function(err,rows){
    if(err){
      console.log(err);
      res.status(500).send('다시 시도해주세요.');
      return false;
    }
    // console.log(rows);
    var result = [];
    rows.forEach(function(item){
      if(item[0] != undefined){
        result.push(item[0]);
      }
    });

    res.send(result);
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {layout: false,message : req.flash('loginMessage')});
});

/* set passport*/
passport.serializeUser(function(user, done) {
  done(null, user.U_id);
});

passport.deserializeUser(function(id, done) {
  /* db 에서 id를 이용하여 user를 얻어서 done을 호출합니다 */
  User.checkId(id, function(err, results) {
    var user = results;
    user.U_pw = bcrypt.hashSync(user.U_pw)
    done(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, username, password, done) {
  User.checkId(username, function(err, results) {
    if (err) {
      return done(err);
    }
    var user = results;
    if (!user) {
      return done(null, false, req.flash('loginMessage', '아이디가 존재하지 않습니다.'));
    }
    if (user.U_pw !== password) {
      return done(null, false, req.flash('loginMessage', '비밀번호가 맞지 않습니다.'));
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
