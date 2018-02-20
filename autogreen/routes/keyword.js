var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('keyword');
});

router.post('/searchKeyInfo',function(req, res, next){
  Keyword.getKeyInfo(req.body.n_idx_c, function(err,result){
    res.send(result);
  });
});

router.post('/searchCnt',function(req, res, next) {
  Contents.getSearchCnt(req.body.CP_title, function(err,result){
    res.send(result);
  });
});

router.post('/add',function(req, res, next) {
  var now = new Date();
  var date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  req.body.date = date;
  var param = req.body;
  console.log("param:",param);
  req.body.keyword.forEach(function(item, idx){
    console.log("param.keyword:",item);
    if(item == ""){
      return;
    }
    param.keyword = item;
    param.K_type = '1';
    if(idx == 1){
      param.K_type = '0';
    }
    Keyword.insertKeyword(param,function(err, results, fields) {
      if(err) throw err;
    });
  });
  res.send(req.body);
});

router.post('/delete',function(req, res, next){
  Keyword.deleteKeyword(req.body.n_idx, function(err,result){
    if(err) throw err;
    res.send(true);
  });
});

module.exports = router;
