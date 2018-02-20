var express = require('express');
var Manual = require('../models/manual.js');
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
  // if(!req.user){
  //   res.redirect('/login');
  // }
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
  Manual.manualCount(searchObject,function(err,result) {
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
    Manual.getManualList(searchObject, function(err,result){
      if(err){
        res.json(err);
      }else{
        res.render('manual',{
          moment: moment,
          data: searchObject,
          mList: result,
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

router.post('/delete', function(req, res, next){
  // if(!req.user){
  //   res.redirect('/login');
  // }
  console.log(req.body.OSP_idx);
  Manual.delete(req.body.OSP_idx, function(err,result){
    if(err) throw err;
  });
  res.send('true');
});

router.post('/update', function(req, res, next){
  // if(!req.user){
  //   res.redirect('/login');
  // }
  console.log(req.body.OSP_idx);
  var u_id_c = Manual.updateSortData(req.body.OSP_idx);
  Manual.getCntDatainfo([u_id_c,req.body.OSP_idx], function(err,result){
    if(err) throw err;
    console.log(u_id_c);``
    delete result[0].OSP_regdate;
    res.send('true');
  });
  // Manual.insertHisData(req.body.OSP_idx, function(err,result){
  //   if(err) throw err;
  //   Manual.deleteAllTable(req.body.OSP_idx, function(err,result){
  //     if(err) throw err;
  //     res.send('true');
  //   });
  // });

});
module.exports = router;
