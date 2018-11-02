var express = require('express');
var router = express.Router();
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
  res.render('mcp/statistics',data);
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
    TState:'',
    oc:'',
    mcpList:await contents.getMCPList('m'),
    cpList:await contents.getMCPList('c'),
    sDate: formatDate(new Date(Date.now() - 1 * 24 * 3600 * 1000)),
    eDate: formatDate(new Date())
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
    data['list'] = await contents.selectView(searchBody,searchParam);
    data['listCount'] = await contents.selectViewCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

module.exports = router;
