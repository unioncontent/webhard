var express = require('express');
var Manual = require('../models/manual.js');
var User = require('../models/user.js');
var moment = require('moment-timezone');
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
    cp_name: '0',
    offset: 0,
    limit: 10
  }
  if (typeof req.query.cp_name !== 'undefined') {
    searchObject.cp_name = req.query.cp_name;
  }
  if (typeof req.query.searchType !== 'undefined') {
    searchObject.searchType = req.query.searchType;
  }
  if (typeof req.query.search !== 'undefined') {
    searchObject.search = req.query.search;
  }
  if (typeof req.query.sDate !== 'undefined') {
    if (typeof req.query.eDate !== 'undefined') {
      searchObject.sDate = req.query.sDate;
      searchObject.eDate = req.query.eDate;
    }
  }
  Manual.manualCount(searchObject,function(err,result) {
    if(err) throw err;
    totalUser = result[0].total;
    console.log(result);
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
    Manual.getManualList(searchObject, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('manual',{
          moment: moment,
          data: searchObject,
          mList: result || [],
          totalUser: totalUser,
          pageCount: pageCount,
          currentPage: currentPage
        });
      }
    });
  });
});

router.post('/api', function(req, res, next) {
  var request = require('request');
  var apiInfo = require('../models/apiInfo.js')[global.osp];
  var data = apiInfo.deletePost(req.body.mode,req.body.idx);

  // 헤더 부분
  var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  // 요청 세부 내용
  var options = {
    url: apiInfo.url,
    method:'POST',
    headers: headers,
    form: data
  }

  request(options,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        res.send(result['data']);
      }
      else{
        res.send(false);
      }
    }
  );
});

router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  var searchObject = {
    cp_name: req.body.cp_name || '0',
    offset: Number(req.body.start) || 0,
    limit: 10
  }
  console.log(req.body);
  if('searchType' in req.body){
    searchObject.searchType = req.body.searchType;
    searchObject.search = req.body.search;
  }
  if ('sDate' in req.body && 'eDate' in req.body) {
    searchObject.sDate = req.body.sDate;
    searchObject.eDate = req.body.eDate;
  }
  var currentPage = req.body.start;
  Manual.manualCount(searchObject, function(err, result) {
    if (err) throw err;
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);

    Manual.getManualList(searchObject, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.send({
          total: total,
          data: searchObject,
          pageCount: pageCount,
          cList: result || []
        });
      }
    });
  });
});

router.post('/getCPList', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  User.getCpAllList(function(err,result){
    if(err) throw err;
    res.send(result);
  });
});

router.post('/delete', function(req, res, next){
  console.log(req.body.OSP_idx);
  Manual.delete(req.body.OSP_idx, function(err,result){
    if(err){
      res.status(500).send('다시 시도해 주세요.');
      return false;
    }
    res.send('true');
  });
});

router.post('/update', function(req, res, next){
  console.log('Manual.updateSortData:',[req.body.K_apply,req.body.OSP_idx]);
  //수동처리 관리상태 수정
  Manual.updateSortData([req.body.K_apply,req.body.OSP_idx],function(err,result){
    if(err){
      res.status(500).send('수동처리 관리상태 수정 에러');
      return false;
    }
    console.log('Manual.getCntDatainfo:',[req.body.OSP_idx,req.body.U_id_c]);
    //크롤링 테이블에서 게시물 정보 가져옴
    Manual.getCntDatainfo([req.body.OSP_idx,req.body.U_id_c], function(err,result){
      if(err){
        res.status(500).send('크롤링 테이블에서 게시물 정보 가져오는 부분 에러');
        return false;
      }
      delete result[0].n_idx;
      delete result[0].OSP_regdate;
      var param = Object.values(result[0]);
      param.unshift(req.body.U_id_c);

      console.log('Manual.insertHisData:',param);
      //히스토리 테이블에서 게시물 저장
      Manual.insertHisData(param, function(err,result){
        if(err){
          console.log(err);
          res.status(500).send('히스토리 테이블에서 게시물 저장 에러');
          return false;
        }
        console.log('Manual.deleteAllTable:',req.body.OSP_idx);
        //크롤링 테이블에서 게시물 삭제
        Manual.deleteAllTable(req.body.OSP_idx, function(err,result){
          if(err) throw err;
          res.send('true');
        });
      });
    });
  });
});
module.exports = router;
