var express = require('express');
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
  // res.render('contents');
});

router.post('/getCPList', function(req, res, next){
  User.getClassAllList('c',function(err,result){
    if(err) throw err;
    res.send(result);
  });
});


router.get('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('contentsAdd')
});

router.get('/keyword', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('keyword')
});

module.exports = router;
