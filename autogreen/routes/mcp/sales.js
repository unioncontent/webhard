var express = require('express');
var router = express.Router();
// DB module
var osp = require('../../models/mcp/osp.js');
var sales = require('../../models/mcp/sales.js');
var contents = require('../../models/mcp/contents.js');

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated() && req.user.U_class != 'c')
    return next();
  res.redirect('/login');
};

router.get('/',isAuthenticated,async function(req, res, next) {
  // var data = await getListPageData(req.query,req.user);
  var data = {};
  data.ospList = await osp.selectOSPList_m(2);
  data.mcpList = await contents.getMCPList('m');
  res.render('mcp/sales',data);
});

router.get('/add',isAuthenticated,async function(req, res, next) {
  var data = {};
  data.ospList = await osp.selectOSPList_m(2);
  data.mcpList = await contents.getMCPList('m');
  res.render('mcp/sales_add',data);
});

router.post('/excelAdd',isAuthenticated,async function(req, res, next) {
  var result = JSON.parse(req.body.data);
  var values = [].map.call(result,async function(item,index) {
    var mcpArr = item['MCP/CP'].split('/');
    var mcp = mcpArr[0];
    var cp = ((mcpArr.length > 1) ? mcpArr[1] : '');

    return [mcp,cp,item['OSP'],item['콘텐츠코드'],item['콘텐츠제목'],item['총매출금액'],item['총판매건'],item['정산매출'],item['정산날짜']];
  });
  var result = await sales.insertExcel(values);
  console.log('insertExcel:',result);
  res.send({status: true});
});

router.post('/add',isAuthenticated,async function(req, res, next) {
  var result = await sales.insert(req.body);
  console.log('insert:',result);
  res.send({status: true});
});


router.post('/add/search',isAuthenticated,async function(req, res, next) {
  var cntList = await sales.selectCnt(req.body.search);
  res.send({list:cntList,status: true});
});
module.exports = router;
