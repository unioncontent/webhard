var express = require('express');
var Filtering = require('../models/filtering.js');
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
  console.log('req.query :',req.query);
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
  Filtering.filteringCount(searchObject,function(err,result) {
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
    console.log('3 : ',searchObject);
    Filtering.getFilteringList(searchObject, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('filtering',{
          moment: moment,
          data: searchObject,
          fList: result || [],
          totalUser: totalUser,
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
  Filtering.filteringCount(searchObject, function(err, result) {
    if (err) throw err;
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);

    Filtering.getFilteringList(searchObject, function(err, result) {

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

router.post('/getCPList', function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  }
  User.getCpAllList(function(err,result){
    if(err) throw err;
    res.send(result);
  });
});

module.exports = router;
