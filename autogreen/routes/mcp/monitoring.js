var express = require('express');
var router = express.Router();
// DB module
var contents = require('../../models/mcp/contents.js');
var monitoring = require('../../models/mcp/monitoring.js');

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/:type',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.params.type,req.query);
  res.render('mcp/monitoring',data);
});

router.post('/:type/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.params.type,req.body);
  res.send({status:true,result:data});
});

async function getListPageData(type,param){
  var data = {
    pType:type,
    list:[],
    listCount:{total:0},
    cp:'',
    mcp:'',
    searchType:'',
    search:'',
    page:1,
    mcpList:await contents.getMCPList('m'),
    cpList:await contents.getMCPList('c')
  };
  var limit = 20;
  // sql qeury ? 파라미터 : osp_tstate,limit
  var typeVal = (type == 'alliance')? '1':'0';
  var searchParam = [typeVal,0,limit];
  var currentPage = 1;
  var searchBody = {};
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[1] = (currentPage - 1) * limit
    data['offset'] = searchParam[1];
  }
  if (typeof param.sDate !== 'undefined') {
    if (typeof param.eDate !== 'undefined') {
      searchBody['sDate'] = param.sDate;
      searchBody['eDate'] = param.eDate;
      data['sDate'] = param.sDate;
      data['eDate'] = param.eDate;
    }
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
    data['list'] = await monitoring.selectView(searchBody,searchParam);
    data['listCount'] = await monitoring.selectViewCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

module.exports = router;
