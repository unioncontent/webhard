var express = require('express');
var mysql = require('mysql');
var moment = require('moment');
var connection = mysql.createConnection(require('../db/db_con.js'));
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  connection.query('SELECT * from user_all_b', function(err, results, fields) {
    if(err) throw err;
    res.render('user',{
      moment: moment,
      uList: results
    });
  });
});

/* GET page. */
router.get('/add', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('userAdd')
});

router.post('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var param = Object.values(req.body);
  if(param[0] == '' || param[2] == '' || param[3] == ''){
    res.status(500).send('다시 입력해 주세요.')
  }

  connection.query('update user_all_b set U_name=?,U_pw=?,U_state=? where U_id=?',param, function(err, results, fields) {
    if(err) throw err;
    res.send('업데이트 완료되었습니다.');
  });
});

router.post('/add', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  var param = Object.values(req.body);
  console.log(param);
  connection.query('insert user_all_b(U_id, U_pw, U_class, U_name, U_state, U_regdate) values(?,?,?,?,?,?);',param, function(err, results, fields) {
    if(err) throw err;
    res.send('거래처 등록이 완료되었습니다.');
  });
});

router.post('/nameCheck', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  console.log(req.body.userName);
  var name = req.body.userName;
  connection.query('select * from user_all_b where U_name=?',name, function(err, results, fields) {
    if(err) throw err;
    var user = results[0];
    if (!user) {
      res.send('success');
    }
    else{
      res.send('fail');
    }
  });
});

module.exports = router
