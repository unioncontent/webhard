var express = require('express');
var router = express.Router();
// DB module
var notice = require('../../models/mcp/notice.js');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.query);
  res.render('mcp/notice',data);
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.body);
  res.send({state:true,result:data});
});

async function getListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    searchType:'',
    search:'',
    page:1
  };
  var limit = 20;
  var searchParam = [0,limit];
  var currentPage = 1;
  var searchBody = {};
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[0] = (currentPage - 1) * limit
    data['offset'] = searchParam[1];
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await notice.selectTable(searchBody,searchParam);
    data['listCount'] = await notice.selectTableCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.post('/add',isAuthenticated,async function(req, res, next) {
  var result = await notice.insert(req.body);
  if(!('protocol41' in result)){
    res.send({state:false,msg:'공지등록에 실패했습니다.'});
    return false;
  }
  res.send({state:true,msg:'공지등록에 성공했습니다.'});
});


router.post('/update',isAuthenticated,async function(req, res, next) {
  var data = await notice.update(req.body);
  if(!('protocol41' in data)){
    res.send({state:false});
    return false;
  }
  res.send({state:true,result:data});
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  var data = await notice.delete(req.body.idx);
  if(data.length == 0){
    res.send({state:false});
    return false;
  }
  res.send({state:true,result:data});
});

router.post('/getInfo',isAuthenticated,async function(req, res, next) {
  var data = await notice.selectNotice(req.body.idx);
  res.send({state:true,result:data});
});

module.exports = router;
