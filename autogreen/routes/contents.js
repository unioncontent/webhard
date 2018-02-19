var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
var router = express.Router();

/* GET page. */
// 페이징
var totalUser = 0;
var pageCount = 0;
var currentPage = 1;

// 검색
var searchType = 'i';
var search = '';

/* GET page. */
router.get('/', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  var searchObject = {
    cpId: '0',
    offset: 0,
    limit: 10
  }
  if (typeof req.query.cpId !== 'undefined') {
    searchObject.cpId = req.query.cpId;
  }
  if (typeof req.query.searchType !== 'undefined') {
    searchObject.searchType = req.query.searchType;
  }
  if (typeof req.query.search !== 'undefined') {
    searchObject.search = req.query.search;
  }

  Contents.contentsCount(searchObject,function(err,result) {
    if(err) throw err;
    totalUser = result[0].total;
    pageCount = Math.ceil(totalUser/searchObject.limit);

    if (typeof req.query.page !== 'undefined') {
      currentPage = req.query.page;
    }
    else{
      currentPage = 1
    }

    if (parseInt(currentPage) > 0) {
      searchObject.offset = (currentPage - 1) * searchObject.limit;
    }

    Contents.getContentsList(searchObject, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('contents',{
          data: searchObject,
          cList: result,
          totalUser: totalUser,
          pageCount: pageCount,
          currentPage: currentPage
        });
      }
    });
  });
});

router.post('/getCPList', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  User.getClassAllList('c',function(err,result){
    if(err) throw err;
    res.send(result);
  });
});

router.post('/update', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  Keyword.updateKeyword(req.body,function(err,result){
    if(err) throw err;
    res.send('true');
  });
});

router.post('/delete', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  Keyword.deleteKeyword(req.body.n_idx_c, function(err,result){
    if(err) throw err;
    Content.deleteContents(req.body.n_idx_c, function(err,result){
      if(err) throw err;
      res.send('true');
    });
  });
});

router.get('/add', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('contentsAdd')
});

router.post('/add', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  var now = new Date();
  var date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  req.body.date = date;
  User.searchOSP(req.body.OSP_id,function(err, results, fields) {
    if(err) throw err;
    // 콘텐츠 ID 설정
    var check = false;
    var sql = 'select count(1) as total from fileis_cnts_list_c';
    Contents.contentsCount(req.body,function(err, results, fields) {
      req.body.CP_CntID = req.body.U_id_c+'-'+req.body.OSP_id+'-'+String(Number(results[0].total)+1);
      check = Contents.insertContents(req.body, function(err, results, fields) {
        if(err) throw err;
        var kParam = req.body;
        if(results[0].n_idx != ""){
          kParam.n_idx_c = results[0].n_idx;
          console.log('kParam : ',kParam);
          Keyword.insertKeyword(kParam,function(err, results, fields) {
            if(err) throw err;
            check = true;
            if(check){
              res.send('콘텐츠 등록이 완료되었습니다.');
            }
          });
        }
      });
      if(check == false){
        res.status(500).send('다시 입력해 주세요.');
      }
    });
  });
});

router.get('/keyword', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('keyword')
});

module.exports = router;
