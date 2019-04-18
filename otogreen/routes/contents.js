var express = require('express');
var router = express.Router();
var fs = require('fs');
// DB module
var contents = require('../models/contents.js');
var keyword = require('../models/keyword.js');

var isAuthenticated = function (req, res, next) {
  console.log('contents 로그인확인:',req.isAuthenticated());
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
    if(req.query.mcp != undefined){
      data.cpList = await contents.getCPList({mcp:req.query.mcp});
    }
  }
  res.render('mcp/contents',data);
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getListPageData(req.body,req.user);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/info',isAuthenticated,async function(req, res, next) {
  try{
    var array = fs.readFileSync('/home/hosting_users/otogreen/apps/otogreen_oto/public/file/country.txt').toString().split("\n");
    var result = await contents.selectInfo(req.body.n_idx);
    var param = {};
    if(req.user.U_class == 'c'){
      param.cp = req.user.U_id;
    }
    else if(req.user.U_class == 'm'){
      param.mcp = req.user.U_id;
    }
    result.cpList = await contents.getCPList(param);
    result.country = array;
    res.send({status:true,result:result});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  var result = await contents.delete(req.body.n_idx);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  result = await keyword.delete([req.body.n_idx,'cpId']);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(true);
});

router.post('/update',isAuthenticated,async function(req, res, next) {
  var result;
  if('cnt_cate' in req.body){
    result = await contents.updateCate(req.body);
    if(!('protocol41' in result)){
      res.status(500);
      return false;
    }
    delete req.body['cnt_cate'];
  }
  if('type' in req.body){
    result = await keyword.updateCpKey(req.body);
    if(!('protocol41' in result)){
      res.status(500);
      return false;
    }
  } else {
    result = await keyword.update(req.body);
    if(!('protocol41' in result)){
      res.status(500);
      return false;
    }
  }
  res.send(true);
});

router.post('/updateCnt',isAuthenticated,async function(req, res, next) {
  var result = await contents.update(req.body);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(true);
});

async function getListPageData(param,user){
  var array = fs.readFileSync('/home/hosting_users/otogreen/apps/otogreen_oto/public/file/country.txt').toString().split("\n");
  var data = {
    list:[],
    listCount:{total:0},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
    searchType:'',
    search:'',
    page:1,
    country: array
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
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await contents.selectView(searchBody,searchParam);
    data['listCount'] = await contents.selectViewCount(searchBody,searchParam);
    data['statistics'] = await contents.getContentsCounts(searchBody,searchParam);
    if(user.U_class == 'a' && param.type == 'selectMCP'){
      data.cpList = await contents.getCPList({mcp:data.mcp});
    }
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.post('/getModalPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getCntListPageData(req.body);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

async function getCntListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    searchType:'',
    search:'',
    page:1,
    osp:0
  };
  var limit = 10;
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
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search.replace(/ /gi,'');
    data['searchType'] = param.searchType;
    data['search'] = param.search.replace(/ /gi,'');
  }
  try{
    data['list'] = await contents.selectBackup(searchBody,searchParam);
    data['listCount'] = await contents.selectBackupCount(searchBody,searchParam);
    data['osp'] = await contents.selectBackupOSPCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.get('/add',isAuthenticated,async function(req, res, next) {
  var array = fs.readFileSync('/home/hosting_users/otogreen/apps/otogreen_oto/public/file/country.txt').toString().split("\n");
  var data = {
    country: array
  };
  if(req.user.U_class == 'm'){
    data.cpList = await contents.getCPList({mcp:req.user.U_id});
  }
  else if(req.user.U_class == 'a'){
    data.mcpList = await contents.getMCPList('m');
    data.cpList = [];
  }
  res.render('mcp/contents_add',data);
});

router.post('/add/getCP',isAuthenticated,async function(req, res, next) {
  console.log('/add/getCP');
  try{
    console.log(req.body);
    var data = await contents.getCPList(req.body);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/add',isAuthenticated,async function(req, res, next) {
  var kParam = {
    k_title:req.body.k_title,
    k_key:1,
    k_state:req.body.k_state,
    k_method:req.body.k_method,
    k_apply:req.body.k_apply,
    k_mailing:req.body.k_mailing
  };
  var sParam = {
    cnt_L_idx:'',
    cnt_s_chk1:req.body.cnt_s_chk1,
    cnt_s_chk2:req.body.cnt_s_chk2,
    cnt_s_chk3:req.body.cnt_s_chk3
  };
  var cParam = req.body;
  delete cParam.cnt_s_chk1;
  delete cParam.cnt_s_chk2;
  delete cParam.cnt_s_chk3;
  delete cParam.k_title, delete cParam.k_state, delete cParam.k_method, delete cParam.k_apply, delete cParam.k_mailing;
  var result = await contents.insert(cParam);
  if(!('insertId' in result)){
    res.status(500).send('콘텐츠 등록이 실패했습니다.');
    return false;
  }
  sParam.cnt_L_idx = result.insertId;
  var cResult = await contents.cntInsertCheck(result.insertId);
  kParam.k_L_idx = cResult.n_idx;
  kParam.k_L_id = cResult.cnt_id;
  kParam.k_mcp = cResult.cnt_mcp;
  kParam.k_cp = cResult.cnt_cp;
  result = await keyword.insert(kParam);
  if(!('insertId' in result)){
    res.status(500).send('콘텐츠 등록이 실패했습니다.');
    return false;
  }
  result = await contents.insert_s(sParam);
  if(!('insertId' in result)){
    res.status(500).send('콘텐츠 등록이 실패했습니다.');
    return false;
  }
  res.send({state:true,msg:'콘텐츠 등록이 완료되었습니다.'});
});

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
    var done = await callback(array[index], index, array);
    if(done == false){
      break;
    }
  }
}

// 시리즈 확인,추가,삭제
router.post('/series/getList',isAuthenticated,async function(req, res, next) {
  try{
    var limit =10;
    var searchParam = [req.body.cIdx,0,limit];
    var searchBody = {};
    var currentPage = 1;
    var data = {
      list:[],
      listCount:{total:0},
      page:1
    }
    if (typeof req.body.page !== 'undefined') {
      currentPage = req.body.page;
      data['page'] = currentPage;
    }
    if (parseInt(currentPage) > 0) {
      searchParam[1] = (currentPage - 1) * limit
      data['offset'] = searchParam[1];
    }
    data['list'] = await contents.selectSeriesList(searchBody,searchParam);
    data['listCount'] = await contents.selectSeriesListCount(searchBody,searchParam);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});
router.post('/series/insert',isAuthenticated,async function(req, res, next) {
  try{
    var result = await contents.insert_s(req.body);
    if(!('insertId' in result)){
      res.status(500).send('시리즈 등록이 실패했습니다.');
      return false;
    }
    res.send(req.body);
  } catch(e){
    res.status(500).send(e);
  }
});
router.post('/series/delete',isAuthenticated,async function(req, res, next) {
  try{
    var data = await contents.delete_s(req.body.idx);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});
module.exports = router;
