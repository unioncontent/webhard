const logger = require('../winston/config_f.js');
var express = require('express');
var xl = require('excel4node');
var moment = require('moment');
var datetime = require('node-datetime');
var fs = require('fs');
var router = express.Router();
// DB modulevar fs = require('fs');
var osp = require('../models/osp.js');
var contents = require('../models/contents.js');
var monitoring = require('../models/monitoring.js');

var isAuthenticated = function (req, res, next) {
  console.log('monitoring 로그인확인:',req.isAuthenticated());
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

router.get('/:type',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.params.type,req.query,req.user);
  console.log(req.query);
  data.ospList = await osp.selectOSPList_m((req.params.type == 'nalliance')?0:1);
  if(req.user.U_class == 'm'){
    data.cpList = await contents.getCPList({mcp:req.user.U_id});
  }
  else if(req.user.U_class == 'a'){
    data.mcpList = await contents.getMCPList('m');
    if (typeof req.query.mcp !== 'undefined') {
      data.cpList = await contents.getCPList({mcp:req.query.mcp});
    }
    else{
      data.cpList = [];
    }
  }
  res.render('monitoring',data);
});

router.post('/:type/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.params.type,req.body,req.user);
  res.send({status:true,result:data});
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  // 키워드 필터링 리스트
  var result = await monitoring.deletechk(table_type,req.body.idx);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  // 키워드 필터링 상세 리스트
  // result = await monitoring.delete('cnt_f_'+table_type+'_detail',{'f_idx':req.body.idx});
  // if(!('protocol41' in result)){
  //   res.status(500);
  //   return false;
  // }
  // 이미지 채증 리스트
  var table_type = ((req.body.pType == 'mobile')? 'm_':'');
  result = await monitoring.delete('go_'+table_type+'img',{'cnt_url':req.body.url});
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(true);
});

router.post('/getInfo',isAuthenticated,async function(req, res, next) {
  // 키워드 필터링 리스트
  var result;
  if('platform' in req.body){
    if(req.body.platform == 'mobile'){
      result= await monitoring.getInfo_m(req.body.idx);
    }
    else{
      result= await monitoring.getInfo(req.body.idx);
    }
  }
  else{
    result= await monitoring.getInfo(req.body.idx);
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

async function getListPageData(type,param,user){
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  dt.offsetInDays(-2);
  var start = dt.format('Y-m-d');

  var data = {
    pType:type,
    type:'0',
    list:[],
    listCount:{total:0},
    // statistics:{},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:(user.U_class == 'c') ? user.cp_mcp:'',
    searchType:'',
    search:'',
    page:1,
    sDate:start,
    eDate:end
  };
  var limit = 20;
  // sql qeury ? 파라미터 : osp_tstate,limit
  var typeVal = (type == 'alliance')? '1':(type == 'nalliance')? '0': '3';
  var searchParam = [typeVal,'','',start,end,0,limit,'','',typeVal,''];

  if(typeVal == '3'){
    data.ospList = await osp.selectOSPList_m(2);
    if(param.platform == 'mobile'){
      searchParam[0] = '4';
    }
    searchParam[2] = ' and f.cnt_L_id =\''+param.cnt_L_id+'\'';
    searchParam[8] = '0';
  }

  var currentPage = 1;
  // var searchBody = {sDate:start,eDate:end};
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (param.platform != '' && param.platform != 'pc') {
    data['plat'] = 'm_';
    searchParam[10] = data['plat'];
  }
  if (parseInt(currentPage) > 0) {
    searchParam[5] = (currentPage - 1) * limit
    data['offset'] = searchParam[5];
  }
  if (typeof param.sDate !== 'undefined') {
    if (typeof param.eDate !== 'undefined') {
      // searchBody['sDate'] = param.sDate;
      // searchBody['eDate'] = param.eDate;
      searchParam[3] = param.sDate.replace(' 00:00:00','')+' 00:00:00';
      searchParam[4] = param.eDate.replace(' 23:59:59','')+' 23:59:59';
      data['sDate'] = param.sDate;
      data['eDate'] = param.eDate;
    }
  }
  if (typeof param.osp !== 'undefined') {
    data['osp'] = param.osp;
    searchParam[7] = data['osp'];
  }
  if (typeof param.state !== 'undefined') {
    data['state'] = param.state;
    searchParam[8] = data['state'];
  }
  if (typeof param.gtype !== 'undefined') {
    data['type'] = param.gtype;
    searchParam[9] = data['type'];
  }
  if (typeof param.cp !== 'undefined') {
    // searchBody['cp'] = param.cp;
    searchParam[1] += ' and f.cnt_cp = \''+param.cp+'\'';
    data['cp'] = param.cp;
  } else if(data['cp'] != '') {
    searchParam[1] += ' and f.cnt_cp = \''+data['cp']+'\'';
  }
  if (typeof param.mcp !== 'undefined') {
    // searchBody['mcp'] = param.mcp;
    searchParam[1] += ' and f.cnt_mcp = \''+param.mcp+'\'';
    data['mcp'] = param.mcp;
  } else if(data['mcp'] != '') {
    searchParam[1] += ' and f.cnt_mcp = \''+data['mcp']+'\'';
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    // searchBody['searchType'] = param.searchType;
    // searchBody['search'] = param.search;
    switch (param.searchType) {
      case 't': searchParam[2] +=' and  (f.cnt_title_null like \'%'+param.search.replace(/ /gi, '')+'%\' or replace(f.cnt_title,\' \', \'\') like \'%'+param.search.replace(/ /gi, '')+'%\')'; break;
      case 'n': searchParam[2] +=' and f.cnt_num =\''+param.search+'\''; break;
      case 'k': searchParam[2] +=' and f.cnt_keyword in (select n_idx from k_word where k_title =\''+param.search+'\')'; break;
    }
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    var result = await monitoring.callMonitoring(searchParam);
    if(data['type'] == '0' || data['type'] == '3' || data['type'] == '4'){
      data['list'] = (result.length > 2) ? result[0]:[];
      data['listCount'] = (result.length > 2) ? result[1][0].total : '0';
    }
    else{
      data['statistics'] = (result.length > 1) ? [result[0][0],result[1][0],result[2][0],result[3][0]] : [{ naTotal: 0, aTotal: 0, total: 0 },{ atotal: 0, dtotal: 0, natotal: 0 },{ naTotal: 0, aTotal: 0, total: 0 },{ atotal: 0, dtotal: 0, natotal: 0 }];
    }
    if(user.U_class == 'a' && param.type == 'selectMCP'){
      data.cpList = await contents.getCPList({mcp:data.mcp});
    }
  }
  catch(e){
    console.log(e);
  }
  return data;
}

module.exports = router;
