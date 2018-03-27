var express = require('express');
var User = require('../models/user.js');
var moment = require('moment-timezone'); // 날짜처리
var router = express.Router();

//Difine variable for Pagination
var totalUser = 0;
var pageSize = 20;
var pageCount = 0;
var start = 0;
var currentPage = 1;
var uClass = 'a';

/* 거래처 리스트 page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }

  if (typeof req.query.class !== 'undefined') {
    uClass = req.query.class;
  }
  console.log('User.userCount');
  User.userCount(uClass,function(err,result) {
    console.log('err:',err);
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
    console.log('User.getUserList');
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
    return res.redirect('/login');
  }

  User.updateUser(req.body,function(err, result) {
    if (err) {
      res.status(500).send('다시 입력해주세요.');
    } else {
      res.send('업데이트 완료되었습니다.');
    }
  });
});

/* 거래처 등록 page. */
router.get('/add', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  res.render('userAdd');
});
router.post('/add', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  User.insertUser(req.body,function(err, result) {
    if (err) {
      res.status(500).send('다시 등록해주세요.');
    } else {
      res.send('거래처 등록이 완료되었습니다.');
    }
  });
});

/* 거래처 page 이동. */
router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  var searchObject = {
    uClass: req.body.uClass || 'a',
    offset: Number(req.body.start) || 0,
    limit: pageSize
  }
  console.log(req.body);
  var currentPage = req.body.start;
  User.userCount(searchObject.uClass, function(err, result) {
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);
    User.getUserList(searchObject, function(err, result) {

      if (err) {
        res.status(500).send('다시시도해주세요.');
      } else {
        res.send({
          total: total,
          data: searchObject,
          pageCount: pageCount,
          uList: result || []
        });
      }
    });
  });
});

/* 거래처 아이디 중복체크 */
router.post('/idCheck', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  var id = req.body.id;
  User.checkOverlapId(id, function(err, results) {
    if(err) throw err;
    var user = results;
    console.log('checkOverlapId:',results);
    if (user) {
      res.send('success');
    }
    else{
      res.send('fail');
    }
  });
});

module.exports = router
