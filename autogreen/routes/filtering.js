var express = require('express');
var Filtering = require('../models/filtering.js');
var User = require('../models/user.js');
var moment = require('moment');
var router = express.Router();

//Difine variable for Pagination
var totalUser = 0;
var pageSize = 10;
var pageCount = 0;
var start = 0;
var currentPage = 1;
var cpId = '0';

/* GET page. */
router.get('/', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  if (typeof req.query.cpId !== 'undefined') {
    cpId = req.query.cpId;
  }

  Filtering.filteringCount(cpId,function(err,result) {
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
    Filtering.getFilteringList({cpId: cpId, offset: start, limit: pageSize}, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('filtering',{
          moment: moment,
          cpId: cpId,
          fList: result,
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

router.post('/getCPList', function(req, res, next){
  User.getClassAllList('c',function(err,result){
    if(err) throw err;
    res.send(result);
  });
});

module.exports = router;
