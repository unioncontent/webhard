var express = require('express');
var datetime = require('node-datetime');
var router = express.Router();
// DB module
var notice = require('../../models/mcp/notice.js');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.query,req.user);
  res.render('mcp/notice',data);
});

// 첨부파일 다운로드
router.get('/download/:date/:fileName',async function(req, res) {
  // console.log('/download/:date/:fileName = ',req.params);
  var filePath = __dirname.replace('\\routes\\mcp','') +'/public/uploads/'+req.params.date;
  var fs = require('fs');
  var fileListLength = fs.readdirSync(filePath).length;
  var count = 1;
  if(fileListLength == 0){
    res.send('해당 날짜의 파일이 없습니다.');
    return false;
  }
  if(req.params.fileName.indexOf('.') == -1){
    var walk    = require('walk');
    var files   = [];

    // Walker options
    var walker  = walk.walk(filePath, { followLinks: false });

    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        var sFileArr = stat.name.split('.');
        if(req.params.fileName == sFileArr[0]){
          filePath +='/'+stat.name;
          res.download(filePath); // Set disposition and send it.
          return false;
        }
        if(fileListLength == count){
          res.send('해당 파일이 삭제되었습니다.');
          return false;
        }
        count += 1;
        next();
    });
  }
  else{
    filePath +='/'+req.params.fileName;
    res.download(filePath);
  }
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.body,req.user);
  res.send({state:true,result:data});
});

async function getListPageData(param,user){
  var data = {
    list:[],
    listCount:{total:0},
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
  if (typeof param.searchType !== 'undefined' && typeof param.search !== 'undefined') {
    searchBody['searchType'] = param.searchType;
    searchBody['search'] = param.search;
    data['searchType'] = param.searchType;
    data['search'] = param.search;
  }
  try{
    if(user.U_class != 'a'){
      searchParam.unshift(user.U_class);
    }
    data['list'] = await notice.selectTable(searchBody,searchParam);
    data['listCount'] = await notice.selectTableCount(searchBody,searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

router.post('/add',isAuthenticated,async function(req, res, next) {
  var result = await notice.insert(req.body);
  if(!('protocol41' in result)){
    res.send({state:false,msg:'공지등록에 실패했습니다.'});
    return false;
  }
  res.send({state:true,msg:'공지등록에 성공했습니다.'});
});


router.post('/update',isAuthenticated,async function(req, res, next) {
  var data = await notice.update(req.body);
  if(!('protocol41' in data)){
    res.send({state:false});
    return false;
  }
  res.send({state:true,result:data});
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  var data = await notice.delete(req.body.idx);
  if(data.length == 0){
    res.send({state:false});
    return false;
  }
  res.send({state:true,result:data});
});

router.post('/getInfo',isAuthenticated,async function(req, res, next) {
  var data = await notice.selectNotice(req.body.idx);
  res.send({state:true,result:data});
});

var fs = require('fs');
var fs_extra = require('fs-extra');
var multiparty = require('multiparty');

async function mkdirsFun (directory) {
  try {
    await fs_extra.ensureDir(directory)
    return directory;
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

router.post('/file_upload',async function (req, res) {
  var date = datetime.create();
  var today = date.format('Ymd');
  var time = date.format('HMS');
  await mkdirsFun('public/uploads/'+today);

  var form = new multiparty.Form({
      autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할 것인가
      uploadDir: 'public/uploads/'+today// 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
  });

  form.parse(req, function (error, fields, files) {
      if (error){
        res.status(500).send(error);
      }

      // 파일 전송이 요청되면 이곳으로 온다.
      // 에러와 필드 정보, 파일 객체가 넘어온다.
      var o_path = files.fileInput[0].path;
      var path = 'public/uploads/'+today+'/';
      var fileRName = time+'_'+files.fileInput[0].originalFilename;
      res.send({
        filePath : path+fileRName,
        fileName : fileRName
      }); // 파일과 예외 처리를 한 뒤 브라우저로 응답해준다.
      fs.rename(o_path, path+fileRName, function(err) {
        if (err) throw err;
        res.end();
      });
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

module.exports = router;
