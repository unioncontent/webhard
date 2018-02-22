var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
var router = express.Router();

// 페이징
var totalUser = 0;
var pageCount = 0;
var currentPage = 1;

// 검색
var searchType = 'i';
var search = '';

router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
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
  // if(!req.user){
  //   res.redirect('/login');
  // }
  User.getClassAllList('c',function(err,result){
    if(err) throw err;
    res.send(result);
  });
});

router.post('/update', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  if(req.body.type === undefined){
    if(req.body.K_method == '0'){
      req.body.K_apply = 'P';
    }
    Keyword.updateKeyword(req.body,function(err,result){
      if(err) throw err;
      res.send('true');
    });
  }
  else if(req.body.type == 'all'){
    delete req.body.type;
    Keyword.updateAllKeyword(req.body,function(err,result){
      if(err) throw err;
      res.send('true');
    });
  }
});

router.post('/delete', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  Keyword.deleteKeyword(req.body.n_idx_c, function(err,result){
    if(err) throw err;
    Contents.deleteContents(req.body.n_idx_c, function(err,result){
      if(err) throw err;
      res.send('true');
    });
  });
});

router.get('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('contentsAdd')
});

router.post('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  // CP ID확인
  User.checkOCId(['c',req.body.U_id_c],function(err, results) {
    if(err || results.length == 0){
      res.status(500).send('CP사를 다시 입력해 주세요.');
      return false;
    }
    // OSP ID확인
    User.checkOCId(['o',req.body.OSP_id],function(err, results) {
      if(err || results.length == 0){
        res.status(500).send('OSP ID를 다시 입력해 주세요.');
        return false;
      }
      // 콘텐츠 ID 설정
      Contents.getNextIdx(req.body,function(err, results, fields) {
        if(err){
          res.status(500).send('다시 입력해 주세요.');
          return false;
        }
        req.body.CP_CntID = req.body.U_id_c+'-'+req.body.OSP_id+'-'+results[0].idx;
        // 콘텐츠 추가
        Contents.insertContents(req.body, function(err, results, fields) {
          if(err){
            res.status(500).send('다시 입력해 주세요.');
            return false;
          }
          var kParam = req.body;
          if(results[0].n_idx != "" && kParam.keyword != ""){
            kParam.n_idx_c = results[0].n_idx;
            kParam.K_key = '1';
            kParam.K_type = '1';
            // 키워드 추가
            Keyword.insertKeyword(kParam,function(err, results, fields) {
              if(err){
                res.status(500).send('다시 입력해 주세요.');
                return false;
              }
              res.send('콘텐츠 등록이 완료되었습니다.');
            });
          }
        });
      });
    });
  });
});

module.exports = router;
