var express = require('express');
var router = express.Router();
// DB module
var osp = require('../../models/mcp/osp.js');
var cp = require('../../models/mcp/cp.js');
var contents = require('../../models/mcp/contents.js');
var keyword = require('../../models/mcp/keyword.js');


var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/:pType',isAuthenticated,async function(req, res, next) {
  var data;
  if(req.params.pType == 'osp'){
    data = await getOSPListPageData(req.query);
  }
  else if(req.params.pType == 'cp'){
    data = await getCPListPageData(req.query);
  }
  else{
    data = await getMailListPageData(req.query);
  }
  res.render('mcp/'+req.params.pType,data);
});

router.post('/:pType/getNextPage',isAuthenticated,async function(req, res, next) {
  var data;
  if(req.params.pType == 'osp'){
    data = await getOSPListPageData(req.body);
  }
  else if(req.params.pType == 'cp'){
    data = await getCPListPageData(req.body);
  }
  res.send({state:true,result:data});
});

async function getOSPListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    tstate:'',
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
  if (typeof param.tstate !== 'undefined') {
    searchBody['tstate'] = param.tstate;
    data['tstate'] = param.tstate;
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await osp.selectView(searchBody,searchParam);
    data['listCount'] = await osp.selectViewCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

async function getCPListPageData(param){
  var data = {
    list:[],
    listCount:{total:0},
    class:'',
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
  if (typeof param.class !== 'undefined') {
    searchBody['class'] = param.class;
    data['class'] = param.class;
  }
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await cp.selectView(searchBody,searchParam);
    data['listCount'] = await cp.selectViewCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

async function getMailListPageData(param){
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
  // try{
  //   data['list'] = await contents.selectView(searchBody,searchParam);
  //   data['listCount'] = await contents.selectViewCount(searchBody,searchParam);
  // }
  // catch(e){
  //   console.log(e);
  // }
  return data;
}

router.post('/:pType/update',isAuthenticated,async function(req, res, next) {
  var data;
  if(req.params.pType == 'osp'){
    data = await osp.update(req.body);
  }
  else if(req.params.pType == 'cp'){
    data = await cp.update(req.body);
  }
  if(data.length == 0){
    res.send({state:false});
    return false;
  }
  res.send({state:true,result:data});
});

router.post('/:pType/delete',isAuthenticated,async function(req, res, next) {
  var data;
  if(req.params.pType == 'osp'){
    data = await osp.delete(req.body.idx);
  }
  else if(req.params.pType == 'cp'){
    data = await cp.delete({type:'idx',val:req.body.idx});
    if(data.length == 0){
      res.send({state:false});
      return false;
    }
    if(req.body['class'] == 'm'){
      data = await cp.delete({type:'mcp',val:req.body.id});
      if(data.length == 0){
        res.send({state:false});
        return false;
      }
    }
    data = await contents.delete2(req.body);
    if(data.length == 0){
      res.send({state:false});
      return false;
    }
    data = await keyword.delete2(req.body);
  }
  if(data.length == 0){
    res.send({state:false});
    return false;
  }
  res.send({state:true,result:data});
});

router.post('/:pType/getInfo',isAuthenticated,async function(req, res, next) {
  var data;
  if(req.params.pType == 'osp'){
    data = await osp.selectOSPInfo(req.body.idx);
  }
  else if(req.params.pType == 'cp'){
    data = await cp.selectCPInfo(req.body.idx);
  }
  res.send({state:true,result:data});
});

router.get('/:pType/add',isAuthenticated,async function(req, res, next) {
  res.render('mcp/'+req.params.pType+'_add');
});

router.post('/:pType/add',isAuthenticated,async function(req, res, next) {
  var result;
  if(req.params.pType == 'osp'){
    result = await osp.insert(req.body);
  }
  else if(req.params.pType == 'cp'){
    result = await cp.insert(req.body);
  }
  if(!('insertId' in result)){
    res.send({state:false,msg:req.params.pType+' 등록이 실패했습니다.'});
    return false;
  }
  res.send({state:true,msg:req.params.pType+' 등록이 성공했습니다.'});
});

router.post('/:pType/idCheck',isAuthenticated,async function(req, res, next) {
  var result;
  if(req.params.pType == 'osp'){
    result = await osp.checkOspId(req.body.id);
  }
  if(req.params.pType == 'cp'){
    result = await cp.checkCPId(req.body.id);
  }
  res.send(result);
});

var fs = require('fs');
var multiparty = require('multiparty');
router.post('/file_upload',async function (req, res) {
  var form = new multiparty.Form({
      autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할 것인가
      uploadDir: 'public/images/company/', // 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
      maxFilesSize: 1024 * 1024 * 5 // 허용 파일 사이즈 최대치
  });

  form.parse(req, function (error, fields, files) {
      // 파일 전송이 요청되면 이곳으로 온다.
      // 에러와 필드 정보, 파일 객체가 넘어온다.
      var path = files.fileInput[0].path;
      res.send(path.replace('public\\','')); // 파일과 예외 처리를 한 뒤 브라우저로 응답해준다.
  });
});

router.post('/file_delete',async function (req, res) {
  // fs.unlinkSync(filePath);
  // res.send(true);
  fs.unlink('C:/gitProject/webhard/autogreen/'+req.body.path, function (err) {
    if (err) throw err;
    console.log('successfully deleted');
    res.send(true);
  });
});

router.post('/getMCPList',isAuthenticated,async function(req, res, next) {
  var data = await contents.getMCPList2('m');
  if(data.length == 0){
    res.send({state:false,msg:'MCP리스트 불어오기에 실패했습니다.'});
    return false;
  }
  res.send({state:true,result:data});
});

module.exports = router;
