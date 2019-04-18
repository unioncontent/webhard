var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = require('node-datetime');
// DB modul
var osp = require('../models/osp.js');
var contents = require('../models/contents.js');
var monitoring = require('../models/monitoring.js');
var monitoring_all = require('../models/monitoring_all.js');

var isAuthenticated = function (req, res, next) {
  console.log('monitoring_w 로그인확인:',req.isAuthenticated());
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

//모니터링 업무
router.get('/',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.query,req.user);
  res.render('mcp/monitoring_work',data);
});
router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.body,req.user);
  res.send({status:true,result:data});
});
router.post('/delete',isAuthenticated,async function(req, res, next) {
  try{
    var list = JSON.parse(req.body.list);
    await asyncForEach(list, async (item, index, array) => {
      // 키워드 필터링 리스트
      console.log(item);
      // 키워드 필터링 상세 리스트
      // result = await monitoring.delete('cnt_f'+table_type+'_detail',{'f_idx':item.idx});
      // if(!('protocol41' in result)){
      //   res.status(500);
      //   return false;
      // }
      // 이미지 채증 리스트
      var table_type = ((item.pType == 'm')? item.pType+'_':'');
      result = await monitoring.delete('cnt_f_'+table_type+'list',{'cnt_url':item.url,'n_idx':item.idx});
      if(!('protocol41' in result)){
        res.status(500);
        return false;
      }
      result = await monitoring.delete('cnt_f_'+table_type+'detail',{'cnt_url':item.url,'f_idx':item.idx});
      if(!('protocol41' in result)){
        res.status(500);
        return false;
      }
      result = await monitoring.delete('go_'+table_type+'img',{'cnt_url':item.url});
      if(!('protocol41' in result)){
        res.status(500);
        return false;
      }
    });
    res.send(true);
  } catch(e){
    console.log('/delete ERROR:',e);
    res.status(500).send(e);
  }
});
router.post('/updateChk',isAuthenticated,async function(req, res, next) {
  var pType = (req.body.ptype=='m')?req.body.ptype+'_':'';
  var result = await monitoring.updateChk(pType,req.body.type,[req.body.idx,req.body.chk]);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(result);
});
router.post('/getInfo',isAuthenticated,async function(req, res, next) {
  // 키워드 필터링 리스트
  var result;
  if(req.body.pType == ''){
    result = await monitoring.getInfo(req.body.idx);
  } else if(req.body.pType == 'm'){
    result = await monitoring.getInfo_m(req.body.idx);
  }

  res.send(result);
});
router.post('/imageCancel',isAuthenticated,async function(req, res, next) {
  console.log('imageCancel:',req.body);
  var result = await monitoring.udpateImg(req.body.type,[req.body.num,req.body.url]);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  result = await monitoring.updateDetail(req.body.type,[req.body.idx,req.body.num]);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(true);
});
async function getListPageData(param,user){
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  dt.offsetInDays(-1);
  var start = dt.format('Y-m-d');

  var data = {
    list:[],
    listCount:0,
    cntList:[],
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
    osp:'',
    tstate:'2',
    searchType:'',
    search:'',
    ptype:'',
    page:1,
    sDate:start,
    eDate:end
  };
  var limit = 20;
  var searchParam = [0,limit];
  var searchBody = {sDate:data.sDate,eDate:data.eDate};
  var currentPage = 1;
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[0] = (currentPage - 1) * limit
    data['offset'] = searchParam[0];
  }
  if (typeof param.chk !== 'undefined') {
    data['cnt_chk_1'] = param.chk;
    searchBody['cnt_chk_1'] = data['cnt_chk_1'];
  }
  if (typeof param.ptype !== 'undefined') {
    if(param.ptype != ''){
      data['ptype'] = param.ptype;
      searchBody['ptype'] = data['ptype'];
    }
  }
  if (typeof param.sDate !== 'undefined') {
    if (typeof param.eDate !== 'undefined') {
      searchBody['sDate'] = param.sDate;
      searchBody['eDate'] = param.eDate;
      data['sDate'] = param.sDate;
      data['eDate'] = param.eDate;
    }
  }
  if (typeof param.osp !== 'undefined') {
    data['osp'] = param.osp;
    searchBody['osp'] = data['osp'];
  }
  if (typeof param.tstate !== 'undefined') {
    data['tstate'] = param.tstate;
    searchBody['tstate'] = data['tstate'];
  }
  if (typeof param.cp !== 'undefined') {
    searchBody['cp'] = param.cp;
    data['cp'] = param.cp;
  } else if(data['cp'] != '') {
    searchBody['cp'] = data['cp'];
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
    data['list'] = await monitoring.selectJoinTable(searchBody,searchParam);
    data['listCount'] = await monitoring.selectJoinTableCount(searchBody,searchParam);
    data.ospList = await osp.selectOSPList_m(data['tstate']);
    if(user.U_class == 'a'){
      data.mcpList = await contents.getMCPList('m');
      if (typeof param.mcp !== 'undefined') {
        data.cpList = await contents.getCPList({mcp:param.mcp});
      }
      else{
        data.cpList = [];
      }
    }
    else if(user.U_class == 'm'){
      data.cpList = await contents.getCPList({mcp:user.U_id});
    }
    else{
      data.cpList = await contents.getCPList({mcp:data.mcp});
    }
  }
  catch(e){
    console.log(e);
  }
  return data;
}

//모니터링 현황
router.get('/all',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData_all(req.query,req.user);
  res.render('mcp/monitoring_all',data);
});
router.post('/all/updateMChk',isAuthenticated,async function(req, res, next) {
  var result = await monitoring.updateMChk(((req.body.pType == 'm')?req.body.pType+'_':''),[req.body.chk,req.body.idx]);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(result);
});
router.post('/all/mchk',isAuthenticated,async function(req, res, next) {
  try{
    var list = JSON.parse(req.body.list);
    await asyncForEach(list, async (item, index, array) => {
      console.log(item);
      // 키워드 필터링 리스트 - cnt_f_mchk
      result = await monitoring.updateMChk(((item.pType=='')?'':item.pType+'_'),[item.idx]);
      if(!('protocol41' in result)){
        res.status(500);
        return false;
      }
    });
    res.send(true);
  } catch(e){
    console.log('/mchk ERROR:',e);
    res.status(500).send(e);
  }
});
router.post('/all/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData_all(req.body,req.user);
  res.send({status:true,result:data});
});
async function getListPageData_all(param,user){
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  var start = dt.format('Y-m-d');

  var data = {
    list:[],
    listCount:0,
    cntList:[],
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
    osp:'',
    tstate:'2',
    searchType:'',
    search:'',
    ptype:'',
    page:1,
    sDate:start,
    eDate:end
  };
  var limit = 20;
  var searchParam = [0,limit];
  var searchBody = {sDate:data.sDate,eDate:data.eDate};
  var currentPage = 1;
  console.log('all : ',param);
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[0] = (currentPage - 1) * limit
    data['offset'] = searchParam[0];
  }
  if (typeof param.chk !== 'undefined') {
    data['cnt_chk_1'] = param.chk;
    searchBody['cnt_chk_1'] = data['cnt_chk_1'];
  }
  if (typeof param.mchk !== 'undefined') {
    data['cnt_f_mchk'] = param.mchk;
    searchBody['cnt_f_mchk'] = data['cnt_f_mchk'];
  }
  if (typeof param.ptype !== 'undefined') {
    if(param.ptype != ''){
      data['ptype'] = param.ptype;
      searchBody['ptype'] = data['ptype'];
    }
  }
  if (typeof param.sDate !== 'undefined') {
    if (typeof param.eDate !== 'undefined') {
      searchBody['sDate'] = param.sDate;
      searchBody['eDate'] = param.eDate;
      data['sDate'] = param.sDate;
      data['eDate'] = param.eDate;
    }
  }
  if (typeof param.osp !== 'undefined') {
    data['osp'] = param.osp;
    searchBody['osp'] = data['osp'];
  }
  if (typeof param.cp !== 'undefined') {
    searchBody['cp'] = param.cp;
    data['cp'] = param.cp;
  } else if(data['cp'] != '') {
    searchBody['cp'] = data['cp'];
  }
  if (typeof param.mcp !== 'undefined') {
    searchBody['mcp'] = param.mcp;
    data['mcp'] = param.mcp;
  } else if(data['mcp'] != '') {
    searchBody['mcp'] = data.mcp;
  }
  if (typeof param.tstate !== 'undefined') {
    data['tstate'] = param.tstate;
    searchBody['tstate'] = data['tstate'];
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await monitoring_all.selectTable(searchBody,searchParam);
    data['listCount'] = await monitoring_all.selectTableCount(searchBody,searchParam);
    data.ospList = await osp.selectOSPList_m(data['tstate']);
    if(user.U_class == 'a'){
      data.mcpList = await contents.getMCPList('m');
      if (typeof param.mcp !== 'undefined') {
        data.cpList = await contents.getCPList({mcp:param.mcp});
      }
      else{
        data.cpList = [];
      }
    }
    else if(user.U_class == 'm'){
      data.cpList = await contents.getCPList({mcp:user.U_id});
    }
    else{
      data.cpList = await contents.getCPList({mcp:data.mcp});
    }
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

module.exports = router;
