const logger = require('../winston/config_f.js');
var express = require('express');
var router = express.Router();
// DB module
var contents = require('../models/contents.js');
var statistics = require('../models/statistics.js');
var keyword = require('../models/keyword.js');

var isAuthenticated = function (req, res, next) {
  logger.info('statistics 로그인확인:',req.isAuthenticated());
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
  res.render('statistics',data);
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getListPageData(req.body,req.user);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

async function getListPageData(param,user){
  var datetime = require('node-datetime');
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  // dt.offsetInDays(-2);
  var start = dt.format('Y-m-d');

  var data = {
    list:[],
    listCount:{total:0},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
    page:1,
    oc:'0',
    sDate: start,
    eDate: end
  };
  logger.info('param',param);
  var limit = 20;
  var searchParam = ['0','',data.mcp,data.cp,'a.osp_sname',data.sDate,data.eDate,0,limit,''];
  var currentPage = 1;
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[7] = (currentPage - 1) * limit
    data['offset'] = searchParam[7];
  }
  if (typeof param.osp !== 'undefined') {
    data['osp'] = param.osp;
    searchParam[9] = data['osp'];
  }
  if (typeof param.oc !== 'undefined') {
    data['oc'] = param.oc;
    searchParam[0] = data['oc'];
    searchParam[4] = (data['oc'] == '1'? 'a.cnt_title': 'a.osp_sname');
  }
  if (typeof param.sDate !== 'undefined' && typeof param.eDate !== 'undefined') {
    data['sDate'] = param.sDate;
    data['eDate'] = param.eDate;
    searchParam[5] = data['sDate'];
    searchParam[6] = data['eDate'];
  }
  searchParam[5] += ' 00:00:00';
  searchParam[6] += ' 23:59:59';
  if (typeof param.mcp !== 'undefined') {
    data['mcp'] = param.mcp;
    searchParam[2] = data['mcp'];
  } else if(data['mcp'] != '') {
    searchParam[2] = data['mcp'];
  }
  if (typeof param.cp !== 'undefined') {
    data['cp'] = param.cp;
    searchParam[3] = data['cp'];
  } else if(data['cp'] != '') {
    searchParam[3] = data['cp'];
  }
  if(user.U_class == 'm' || searchParam[2] != ''){
    searchParam[1] = 'm';
  }
  if(user.U_class == 'c' || searchParam[3] != ''){
    searchParam[1] = 'c';
  }
  try{
    logger.info('searchParam : ',searchParam);
    var result = await statistics.call_stats(searchParam);
    // if(data['osp'] == 'bondisk'){
    //   logger.info('result :',result);
    // }
    data['list'] = (result.length > 0) ? result[0] : [];
    data['listCount'] = (result.length > 1) ? result[1][0].total : [];
  }
  catch(e){
    logger.info(e);
  }
  return data;
}

router.post('/all/getNextPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getListPageData_ALL(req.body,req.user);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

async function getListPageData_ALL(param,user){
  var datetime = require('node-datetime');
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  // dt.offsetInDays(-2);
  var start = dt.format('Y-m-d');

  var data = {
    list:[],
    listCount:{total:0},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
    page:1,
    sDate: start,
    eDate: end
  };
  logger.info('param',param);
  var limit = 10;
  var searchBody = {type:'p'};
  var searchParam = [0,limit];
  var currentPage = 1;
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[0] = (currentPage - 1) * limit
    data['offset'] = searchParam[0];
  }
  // osp
  if (typeof param.osp !== 'undefined') {
    data['osp'] = param.osp;
    searchBody['osp'] = data['osp'];
  }
  // cid
  if (typeof param.cid !== 'undefined') {
    data['cnt_L_id'] = param.cid;
    searchBody['cnt_L_id'] = data['cnt_L_id'];
  }
  // type
  if (typeof param.type !== 'undefined') {
    data['type'] = param.type;
    searchBody['type'] = data['type'];
  }
  // title
  if (typeof param.title !== 'undefined') {
    data['title'] = param.title;
    searchBody['title'] = data['title'];
  }
  // date
  if (typeof param.sDate !== 'undefined' && typeof param.eDate !== 'undefined') {
    data['sDate'] = param.sDate;
    data['eDate'] = param.eDate;
    searchBody['sDate'] = data['sDate'];
    searchBody['eDate'] = data['eDate'];
  }
  searchBody['sDate'] += ' 00:00:00';
  searchBody['eDate'] += ' 23:59:59';
  // mcp
  if (typeof param.mcp !== 'undefined') {
    data['mcp'] = param.mcp;
    searchBody['mcp'] = data['mcp'];
  } else if(data['mcp'] != '') {
    searchBody['mcp'] = data['mcp'];
  }
  // cp
  if (typeof param.cp !== 'undefined') {
    data['cp'] = param.cp;
    searchBody['cp'] = data['cp'];
  } else if(data['cp'] != '') {
    searchBody['cp'] = data['cp'];
  }
  // search
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await statistics.selectTable(searchBody,searchParam);
    data['listCount'] = await statistics.selectTableCount(searchBody,searchParam);
  }
  catch(e){
    logger.info(e);
  }
  return data;
}

module.exports = router;
