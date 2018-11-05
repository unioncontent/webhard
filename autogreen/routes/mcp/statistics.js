var express = require('express');
var router = express.Router();
// DB module
var contents = require('../../models/mcp/contents.js');
var statistics = require('../../models/mcp/statistics.js');
var keyword = require('../../models/mcp/keyword.js');

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated())
    return next();
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
  res.render('mcp/statistics',data);
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  try{
    var data = await getListPageData(req.body,req.user);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

function formatDate(d) {
  var month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();
  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  return [year, month, day].join('-');
}

async function getListPageData(param,user){
  var data = {
    list:[],
    listCount:{total:0},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:'',
    page:1,
    tstate:'1',
    oc:'0',
    sDate: formatDate(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)),
    eDate: formatDate(new Date())
  };
  var limit = 10;
  var searchParam = [data.oc,data.tstate,data.mcp,data.cp,'a.cnt_osp',data.sDate,data.eDate,0,limit];
  var currentPage = 1;
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[7] = (currentPage - 1) * limit
    data['offset'] = searchParam[1];
  }
  if (typeof param.oc !== 'undefined') {
    data['oc'] = param.oc;
    searchParam[0] = data['oc'];
    searchParam[4] = (data['oc'] == '1'? 'a.cnt_title': 'a.cnt_osp');
  }
  if (typeof param.tstate !== 'undefined') {
    data['tstate'] = param.tstate;
    searchParam[1] = data['tstate'];
  }
  if (typeof param.sDate !== 'undefined' && typeof param.eDate !== 'undefined') {
    data['sDate'] = param.sDate;
    data['eDate'] = param.eDate;
    searchParam[5] = data['sDate'];
    searchParam[6] = data['eDate'];
  }
  if (typeof param.cp !== 'undefined') {
    data['cp'] = param.cp;
    searchParam[3] = data['cp'];
  }
  if (typeof param.mcp !== 'undefined') {
    data['mcp'] = param.mcp;
    searchParam[2] = data['mcp'];
  }
  try{
    var result = await statistics.call_stats(searchParam);
    data['list'] = (result.length > 0) ? result[0] : [];
    data['listCount'] = (result.length > 1) ? result[1][0].total : [];
    data['totalCountList'] = (result.length > 2) ? result[2][0] : {total:0,atotal:0,natotal:0};
  }
  catch(e){
    console.log(e);
  }
  return data;
}

module.exports = router;
