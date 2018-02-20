var express = require('express');
var Filtering = require('../models/filtering.js');
var User = require('../models/user.js');
var moment = require('moment');
var router = express.Router();

// 페이징
var totalUser = 0;
var pageCount = 0;
var currentPage = 1;

// 검색
var searchType = 'i';
var search = '';

/* GET page. */
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
    // console.log('1 : ',searchObject);
  }
  if (typeof req.query.searchType !== 'undefined') {
    searchObject.searchType = req.query.searchType;
    // console.log('2 : ',searchObject);
  }
  if (typeof req.query.search !== 'undefined') {
    searchObject.search = req.query.search;
    // console.log('3 : ',searchObject);
  }
  Filtering.filteringCount(searchObject,function(err,result) {
    // console.log('after:',searchObject);
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
    // console.log('3 : ',searchObject);
    Filtering.getFilteringList(searchObject, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('filtering',{
          moment: moment,
          data: searchObject,
          fList: result,
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

module.exports = router;
