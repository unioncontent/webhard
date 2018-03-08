var express = require('express');
var User = require('../models/user.js');
var moment = require('moment'); // 날짜처리
var router = express.Router();

//Difine variable for Pagination
var totalUser = 0;
var pageSize = 10;
var pageCount = 0;
var start = 0;
var currentPage = 1;
var uClass = 'a';

/* 거래처 리스트 page. */
router.get('/', function(req, res, next) {
  console.log(req);
  if(!req.user){
    res.redirect('/login');
  }

  if (typeof req.query.class !== 'undefined') {
    uClass = req.query.class;
  }

  User.userCount(uClass,function(err,result) {
    if(err) throw err;
    totalUser = result[0].total;
    pageCount = Math.ceil(totalUser/pageSize);

    if (typeof req.query.page !== 'undefined') {
      currentPage = req.query.page;
    }
    else{
      currentPage = 1
    }

    if (parseInt(currentPage)>0) {
      start = (currentPage - 1) * pageSize;
    }
    User.getUserList({uClass: uClass,offset: start, limit: pageSize}, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('user',{
          moment: moment,
          uClass: uClass,
          userData: result || [],
          totalUser: totalUser,
          minusCount: (currentPage - 1) * pageSize,
          pageCount: pageCount,
          pageSize: pageSize,
          currentPage: currentPage
        });
      }
    });
  });
});

/* 거래처 정보 업데이트 */
router.post('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var param = Object.values(req.body);
  if(param[0] == '' || param[2] == '' || param[3] == ''){
    res.status(500).send('다시 입력해 주세요.');
    return false;
  }

  var promise = require('../db/db_promise.js');
  var DBpromise = new promise(global.osp);
  DBpromise.query('update user_all_b set U_name=?,U_pw=?,U_state=? where U_id=?',param).then(rows => {
    res.send('업데이트 완료되었습니다.');
  })
  .then(rows =>{
    DBpromise.close();
  })
  .catch(function (err) {
    res.status(500).send('다시 시도해 주세요.');
    return false;
  });
});

/* 거래처 등록 page. */
router.get('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('userAdd');
});
router.post('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var param = Object.values(req.body);
  var promise = require('../db/db_promise.js');
  var DBpromise = new promise(global.osp);
  DBpromise.query('insert user_all_b(U_id, U_pw, U_class, U_name, U_state, U_regdate) values(?,?,?,?,?,?)',param).then(rows => {
    res.send('거래처 등록이 완료되었습니다.');
  })
  .then(rows =>{
    DBpromise.close();
  })
  .catch(function (err) {
    res.status(500).send('다시 입력해 주세요.');
  });
});

/* 거래처 page 이동. */
router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  var searchObject = {
    uClass: req.body.uClass || 'a',
    offset: Number(req.body.start) || 0,
    limit: 10
  }
  console.log(req.body);
  var currentPage = req.body.start;
  User.userCount(searchObject.uClass, function(err, result) {

    if (err) throw err;
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);
    User.getUserList(searchObject, function(err, result) {

      if (err) {
        throw err;
      } else {
        res.send({
          total: total,
          data: searchObject,
          pageCount: pageCount,
          cList: result
        });
      }
    });
  });
});

/* 거래처 아이디 중복체크 */
router.post('/idCheck', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var id = req.body.id;
  User.checkId(id, function(err, results) {
    if(err) throw err;
    var user = results;
    if (!user) {
      res.send('success');
    }
    else{
      res.send('fail');
    }
  });
});

module.exports = router
