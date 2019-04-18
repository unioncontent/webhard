var express = require('express');
var router = express.Router();
var fs = require('fs');
// DB module
var contents = require('../../models/mcp/contents.js');
var keyword = require('../../models/mcp/keyword.js');

var isAuthenticated = function (req, res, next) {
  console.log('keyword 로그인확인:',req.isAuthenticated());
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

router.get('/',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.query,req.user);
  if(req.user.U_class == 'm'){
    data.cpList = await contents.getCPList({mcp:req.user.U_id});
  }
  else if(req.user.U_class == 'a'){
    data.mcpList = await contents.getMCPList('m');
    data.cpList = [];
  }
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
    console.log(req.body,req.user);
    var data = await getListPageData(req.body,req.user);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});
async function getListPageData(param,user){
  var data = {
    list:[],
    listCount:{total:0},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
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
    data['offset'] = searchParam[0];
  }
  if (typeof param.cp !== 'undefined') {
    searchBody['cp'] = param.cp;
    data['cp'] = param.cp;
  } else if(data['cp'] != '') {
    searchBody['cp'] = data.cp;
  }
  if (typeof param.mcp !== 'undefined') {
    searchBody['mcp'] = param.mcp;
    data['mcp'] = param.mcp;
  } else if(data['mcp'] != '') {
    searchBody['mcp'] = data.mcp;
  }
  try{
    console.log(searchBody,searchParam);
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
    data['offset'] = searchParam[0];
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
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

module.exports = router;
