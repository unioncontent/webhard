var express = require('express');
var router = express.Router();
var fs = require('fs');
// DB module
var contents = require('../../models/mcp/contents.js');
var keyword = require('../../models/mcp/keyword.js');

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.query);
  res.render('mcp/keyword',data);
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  try{
    var data = await keyword.delete([[req.body.mcp,req.body.cp],'all']);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getListPageData(req.body);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});
async function getListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    cp:'',
    mcp:'',
    page:1,
    mcpList:await contents.getMCPList('m'),
    cpList:await contents.getMCPList('c')
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
  if (typeof param.cp !== 'undefined') {
    searchBody['cp'] = param.cp;
    data['cp'] = param.cp;
  }
  if (typeof param.mcp !== 'undefined') {
    searchBody['mcp'] = param.mcp;
    data['mcp'] = param.mcp;
  }
  try{
    data['list'] = await keyword.selectCntList(searchBody,searchParam);
    data['listCount'] = await keyword.selectCntListCount(searchBody);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.get('/info',isAuthenticated,async function(req, res, next) {
  var data = await getInfoListPageData(req.query);
  res.render('mcp/keyword_info',data);
});
router.post('/info/getKwd',isAuthenticated,async function(req, res, next) {
  try{
    var data = await keyword.selectKwdDetailList(req.body.idx);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/info/insert',isAuthenticated,async function(req, res, next) {
  try{
    var param = req.body;
    asyncForEach(param.keyword, async (item, index, array) => {
      if(item == ""){
        if(index == 1){
          res.send(req.body);
        }
        return;
      }
      console.log(item,param);
      param.k_key = '1';
      if(index == 1){
        param.k_key = '0';
      }
      await keyword.insertKwd(item,param);
      if(index == 1){
        res.send(req.body);
      }
    });
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/info/update',isAuthenticated,async function(req, res, next) {
  try{
    var data = await keyword.updateOneKeyword(req.body);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/info/delete',isAuthenticated,async function(req, res, next) {
  try{
    var data = await keyword.delete([req.body.idx,req.body.type]);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/info/getNextPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getInfoListPageData(req.body);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});
async function getInfoListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    cp:'',
    mcp:'',
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
  if (typeof param.cp !== 'undefined') {
    searchBody['cp'] = param.cp;
    data['cp'] = param.cp;
  }
  if (typeof param.mcp !== 'undefined') {
    searchBody['mcp'] = param.mcp;
    data['mcp'] = param.mcp;
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await keyword.selectKwdList(searchBody,searchParam);
    data['listCount'] = await keyword.selectKwdListCount(searchBody);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
    var done = await callback(array[index], index, array);
    if(done == false){
      break;
    }
  }
}

router.post('/getCP',isAuthenticated,async function(req, res, next) {
  try{
    var data = await contents.getCPList(req.body);
    console.log('getCP:',data);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

module.exports = router;
