var express = require('express');
var router = express.Router();
var fs = require('fs');
// DB module
var contents = require('../../models/mcp/contents.js');
var keyword = require('../../models/mcp/keyword.js');

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

var isAuthenticated2 = function (req, res, next) {
  if (req.isAuthenticated() && req.user.U_class != 'c')
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
  if('type' in req.body){
    result = await keyword.updateCpKey(req.body);
    if(!('protocol41' in result)){
      res.status(500);
      return false;
    }
  } else{
    result = await keyword.update(req.body);
    if(!('protocol41' in result)){
      res.status(500);
      return false;
    }
  }
  res.send(true);
});

async function getListPageData(param,user){
  var array = fs.readFileSync('public/file/country.txt').toString().split("\n");
  var data = {
    list:[],
    listCount:{total:0},
    cp:(user.U_class == 'c') ?  user.U_id:'',
    mcp:(user.U_class == 'm') ? user.U_id:'',
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
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    data['list'] = await contents.selectView(searchBody,searchParam);
    data['listCount'] = await contents.selectViewCount(searchBody,searchParam);
    if(user.U_class == 'a' && param.type == 'selectMCP'){
      data.cpList = await contents.getCPList({mcp:data.mcp});
    }
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.get('/add',isAuthenticated2,async function(req, res, next) {
  var array = fs.readFileSync('public/file/country.txt').toString().split("\n");
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

router.post('/add/getCP',isAuthenticated2,async function(req, res, next) {
  console.log('/add/getCP');
  try{
    console.log(req.body);
    var data = await contents.getCPList(req.body);
    res.send({status:true,result:data});
  } catch(e){
    res.status(500).send(e);
  }
});

router.post('/add',isAuthenticated2,async function(req, res, next) {
  var kParam = {
    k_title:req.body.k_title,
    k_key:1,
    k_state:req.body.k_state,
    k_method:req.body.k_method,
    k_apply:req.body.k_apply,
    k_mailing:req.body.k_mailing
  };
  var cParam = req.body;
  delete cParam.k_title, delete cParam.k_state, delete cParam.k_method, delete cParam.k_apply, delete cParam.k_mailing;
  var result = await contents.insert(cParam);
  if(!('insertId' in result)){
    res.status(500).send('콘텐츠 등록이 실패했습니다.');
    return false;
  }
  var cResult = await contents.cntInsertCheck(result.insertId);
  console.log(cResult);
  kParam.k_L_idx = cResult.n_idx;
  kParam.k_L_id = cResult.cnt_id;
  kParam.k_mcp = cResult.cnt_mcp;
  kParam.k_cp = cResult.cnt_cp;
  result = await keyword.insert(kParam);
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

var count = 0;
var totalCount = 0;
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});
var upload = multer({ storage: storage });
//엑셀 1열 값이 맞는지 확인
var compare = function(a){
	var i = 0, j;
  var b = [ 'cnt_mcp','cnt_cp','cnt_title','cnt_eng_title', 'cnt_director', 'cnt_nat','cnt_cate','cnt_cpid','cnt_period','cnt_price','cnt_hash','cnt_mureka','cnt_acom','k_key','k_state','k_apply','k_mailing'];
	if(Array.isArray(a)){
		if(a.length != b.length) return false;
		for(j = a.length ; i < j ; i++) if(!compare(a[i], b[i])) return false;
		return true;
	}
	return a === b;
};

router.post('/add/upload', upload.single('excel'), function(req, res){
  count = 0;
  totalCount = 0;

  if (!req.file) {
    console.log("No file passed");
    return res.redirect('http://otogreen.co.kr/cnts/add?upload=false&msg=1_NoFileError');
  }

  var xlstojson = require("xls-to-json-lc");
  var xlsxtojson = require("xlsx-to-json-lc");
  if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
    exceltojson = xlsxtojson;
  } else {
    exceltojson = xlstojson;
  }

  try {
    exceltojson({
      input: req.file.path, //the same path where we uploaded our file
      output: null, //since we don't need output.json
      lowerCaseHeaders: true
    }, function(err, result) {
      if (err) {
        console.log("exceltojson err:",err);
        return res.redirect('http://otogreen.co.kr/cnts/add?upload=false&msg=1_ExcelSysError');
      }
      totalCount = result.length;
      asyncForEach(result, async (item, index, array) => {
        // if(index == 0){
        //   var headerCheck = await compare(Object.keys(array[0]));
        //   if(!headerCheck){
        //     res.redirect('/cnts/add?upload=false&msg=1_ExcelHeaderError');
        //     return false;
        //   }
        // }

        // console.log("each", item);
        item['k_title'] = (item["k_title"] != '') ? item["k_title"] : item["cnt_title"];
        if(item["cnt_title"] == '' || item["cnt_price"] == ''){
          // data는 없고 배열 마지막이라면
          if((index+1) == totalCount){
            res.redirect('http://otogreen.co.kr/cnts/add?upload=true');
            return true;
          }
          return 'notData';
        }

        var returnValue = await addContents(item);
        console.log('addContents:',returnValue);
        console.log('count:',count);
        console.log('totalCount:',totalCount);
        if(returnValue[0] && count == totalCount){
          res.redirect('/cnts/add?upload=true');
          return true;
        }
        else if(returnValue[0] == false){
          res.redirect('http://otogreen.co.kr/cnts/add?upload=false&msg='+count.toString()+'_'+returnValue[1]);
          return false;
        }
      });
    });
  } catch (e) {
    console.log("Corupted excel file err:",e);
    return res.redirect('http://otogreen.co.kr/cnts/add?upload=false&msg=1_ExcelSysError');
  }
  var fs = require('fs');
  try {
    fs.unlinkSync(req.file.path);
  } catch(e) {
    console.log("uploads 파일 삭제 에러:",e);
  }
});

async function addContents(data){
  try{
    var idArray = await contents.getCPlistID([data.cnt_mcp,data.cnt_mcp,data.cnt_cp,data.cnt_cp]);
    if(idArray.length < 2){
      throw new Error('IdError');
    }
    var kParam = {
      k_title:data.k_title,
      k_key:1,
      k_state:data.k_state,
      k_apply:data.k_apply,
      k_mailing:data.k_mailing
    };
    var cParam = data;
    cParam.cnt_mcp = idArray[0].cp_id;
    cParam.cnt_cp = idArray[1].cp_id;
    delete cParam.k_title, delete cParam.k_state, delete cParam.k_apply, delete cParam.k_mailing;
    var result = await contents.insert(cParam);
    if(!('insertId' in result)){
      throw new Error('CntListInsertError');
    }
    var cResult = await contents.cntInsertCheck(result.insertId);
    kParam.k_L_idx = cResult.n_idx;
    kParam.k_L_id = cResult.cnt_id;
    kParam.k_mcp = cResult.cnt_mcp;
    kParam.k_cp = cResult.cnt_cp;
    result = await keyword.insert(kParam);
    if(!('insertId' in result)){
      await contents.delete(sql,cResult.n_idx);
      throw new Error('KwdInsertError');
    }
    console.log(count,'번 콘텐츠&키워드 insert 끝');
  } catch(error){
    console.log(error.message);
    var msg = error.message;
    if('code' in error){
      if(error.code == 'ER_DUP_ENTRY'){
        return [true,'콘텐츠 등록 성공'];
      }
      msg = error.code;
    }
    return [false,msg];
  } finally {
    count += 1;
  }
  return [true,'콘텐츠 등록 성공'];
}

module.exports = router;
