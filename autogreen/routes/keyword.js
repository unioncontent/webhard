var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  Keyword.getCPKeywordCount(function(err,result){
    res.render('keyword',{
      kcList: result || []
    });
  });
});

// 페이징
var totalUser = 0;
var pageCount = 0;
var currentPage = 1;

router.get('/info', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var searchObject = {
    cp: req.query.cp,
    offset: 0,
    limit: 50
  }
  console.log('req.query -',req.query);
  if (typeof req.query.searchType !== 'undefined') {
    searchObject.searchType = req.query.searchType;
  }
  if (typeof req.query.search !== 'undefined') {
    searchObject.search = req.query.search;
  }
  Keyword.getCPKeywordPageTotal(searchObject,function(err,result) {
    if(err) throw err;
    console.log('getCPKeywordPageTotal -',result);
    total = result[0].total;
    pageCount = Math.ceil(total/searchObject.limit);

    if (typeof req.query.page !== 'undefined') {
      currentPage = req.query.page;
    }
    else{
      currentPage = 1
    }

    if (parseInt(currentPage) > 0) {
      searchObject.offset = (currentPage - 1) * searchObject.limit;
    }
    Keyword.getCPKeyword(searchObject, function(err,result,iResult){
      console.log('getCPKeyword -',result.length,iResult);
      if(err){
        res.json(err);
      }else{
        res.render('keywordInfo',{
          data: searchObject,
          info: iResult,
          kcList: result || [],
          total: total,
          pageCount: pageCount,
          currentPage: currentPage
        });
      }
    });
  });
});

router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  var searchObject = {
    cp: req.body.cp,
    offset: Number(req.body.start) || 0,
    limit: 50
  }
  console.log(req.body);
  if('searchType' in req.body){
    searchObject.searchType = req.body.searchType;
    searchObject.search = req.body.search;
  }
  var currentPage = req.body.start;
  Keyword.getCPKeywordPageTotal(searchObject, function(err, result) {
    if (err) throw err;
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);
    Keyword.getCPKeyword(searchObject, function(err, result,iResult) {
      if (err) {
        throw err;
      } else {
        res.send({
          total: total,
          data: searchObject,
          pageCount: pageCount,
          kcList: result || []
        });
      }
    });
  });
});

router.post('/searchKeyInfo',function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  Keyword.getKeyInfo(req.body.n_idx_c, function(err,result){
    console.log(result);
    res.send(result || []);
  });
});

router.post('/searchCnt',function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  Contents.getSearchCnt(req.body.CP_title, function(err,result){
    res.send(result);
  });
});

router.post('/add',function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var param = req.body;
  console.log("param:",param);
  req.body.keyword.forEach(function(item, idx){
    console.log("param.keyword:",item);
    if(item == ""){
      if(idx == 1){
        res.send(req.body);
      }
      return;
    }
    param.keyword = item;
    param.K_type = '1';
    if(idx == 1){
      req.body.endIdx = idx;
      param.K_type = '0';
    }
    Keyword.insertKeyword(param,function(err, results) {
      if(err){
        res.status(500).send('다시 입력해 주세요.');
        return false;
      }
      if(req.body.endIdx == 1){
        res.send(req.body);
      }
    });
  });
});

router.post('/delete',function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  var type = 'k_idx';
  var value = req.body.n_idx;
  if('type' in req.body){
    type = req.body.type;
  }
  if('cpId' in req.body){
    value = req.body.cpId;
  }
  Keyword.deleteKeyword([value,type], function(err,result){
    if(err) throw err;
    res.send(true);
  });
});

module.exports = router;
