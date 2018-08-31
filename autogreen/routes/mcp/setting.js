var express = require('express');
var router = express.Router();
// DB module
var osp = require('../../models/mcp/osp.js');

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/osp',isAuthenticated,async function(req, res, next) {
  var data = await getOSPListPageData(req.query);
  res.render('mcp/osp',data);
});

router.post('/osp/update',isAuthenticated,async function(req, res, next) {
  var data = await osp.update(req.body);
  if(data.length == 0){
    console.log(data.length);
    res.send({status:false});
    return false;
  }
  res.send({status:true,result:data});
});

router.post('/osp/delete',isAuthenticated,async function(req, res, next) {
  var data = await osp.delete(req.body.idx);
  if(data.length == 0){
    res.send({status:false});
    return false;
  }
  res.send({status:true,result:data});
});

router.post('/osp/getOSPInfo',isAuthenticated,async function(req, res, next) {
  var data = await osp.selectOSPInfo(req.body.idx);
  res.send({status:true,result:data});
});

router.post('/osp/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getOSPListPageData(req.body);
  res.send({status:true,result:data});
});

async function getOSPListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    tstate:'',
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
  if (typeof param.tstate !== 'undefined') {
    searchBody['tstate'] = param.tstate;
    data['tstate'] = param.tstate;
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await osp.selectView(searchBody,searchParam);
    data['listCount'] = await osp.selectViewCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.get('/osp/add',isAuthenticated,async function(req, res, next) {
  res.render('mcp/osp_add');
});

router.post('/osp/add',isAuthenticated,async function(req, res, next) {
  var result = await osp.insert(req.body);
  if(!('insertId' in result)){
    res.send({state:false,msg:'OSP 등록이 실패했습니다.'});
    return false;
  }
  res.send({state:true,msg:'OSP 등록이 성공했습니다.'});
});

router.post('/osp/idCheck',isAuthenticated,async function(req, res, next) {
  var result = await osp.checkOspId(req.body.id);
  res.send(result);
});

router.get('/cp',isAuthenticated,async function(req, res, next) {
  res.render('mcp/cp');
});

router.get('/cp/add',isAuthenticated,async function(req, res, next) {
  res.render('mcp/cp_add');
});

router.get('/mailing',isAuthenticated,async function(req, res, next) {
  res.render('mcp/mailing');
});

module.exports = router;
