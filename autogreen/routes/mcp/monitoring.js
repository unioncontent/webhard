var express = require('express');
var xl = require('excel4node');
var moment = require('moment');
var datetime = require('node-datetime');
var fs = require('fs');
var router = express.Router();
// DB modulevar fs = require('fs');
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
  if(req.user.U_class == 'm'){
    data.cpList = await contents.getCPList({mcp:req.user.U_id});
  }
  else if(req.user.U_class == 'a'){
    data.mcpList = await contents.getMCPList('m');
    data.cpList = [];
  }
  res.render('mcp/monitoring',data);
});

router.post('/:type/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.params.type,req.body);
  res.send({status:true,result:data});
});

const aDir = 'D:/webhard/autogreen/';
router.get('/:type/excel',async function(req, res) {
  var typeVal = (req.params.type == 'alliance')? '1':'0';
  // var list = await monitoring.selectView(req.query,[typeVal]);
  var list = await monitoring.selectExcel(req.query,[typeVal]);
  var wb = new xl.Workbook({
    defaultFont: {
      size: 12,
      color: '#000000'
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      fgColor: '#FFFFFF'
    },
    alignment: {
      horizontal: 'left'
    },
    numberFormat: '$#,##0;-'
  });
  var ws = wb.addWorksheet('sheet1');
  var tStyle = wb.createStyle({
    font: {
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      fgColor: '#ffeb3b',
    },
    alignment: {
      horizontal: 'center'
    }
  });
  // ws.column(3).setWidth(60);
  ws.cell(1,1).string('NO').style(tStyle);
  ws.cell(1,2).string('OSP').style(tStyle);
  ws.cell(1,3).string('MCP').style(tStyle);
  ws.cell(1,4).string('CP').style(tStyle);
  ws.cell(1,5).string('콘텐츠제목').style(tStyle);
  ws.cell(1,6).string('키워드').style(tStyle);
  ws.cell(1,7).string('제목').style(tStyle);
  ws.cell(1,8).string('게시물번호').style(tStyle);
  ws.cell(1,9).string('판매금액').style(tStyle);
  ws.cell(1,10).string('판매자').style(tStyle);
  ws.cell(1,11).string('검출일').style(tStyle);
  ws.cell(1,12).string('채증시간').style(tStyle);
  ws.cell(1,13).string('URL').style(tStyle);
  ws.cell(1,14).string('채증이미지').style(tStyle);
  var row = 0;
  await asyncForEach(list, async (item, index, array) => {
    row = index+2;
    // var dateStr = (item.cnt_regdate == null) ? '':item.cnt_regdate;
    // var dateArr = dateStr.split(',');
    // if(dateArr.length == 3){
    var dateStr = '';
    var imgStr = '';
    if(item.cnt_img_1 != '/untitled.jpg' && item.cnt_img_1 != null){
      // dateStr = '1차 :'+dateArr[0]+', 2차 :'+dateArr[1]+', 3차 :'+dateArr[2];
      dateStr += '1차 :'+item.cnt_date_1;
      imgStr += '1차 :'+item.cnt_img_1;
    }
    // else if(dateArr.length == 2){
    if(item.cnt_img_2 != '/untitled.jpg' && item.cnt_img_2 != null){
      dateStr += '\n2차 :'+item.cnt_date_2;
      imgStr += '\n2차 :'+item.cnt_img_2;
    }
    // else if(dateArr.length == 1){
    if(item.cnt_img_3 != '/untitled.jpg'  && item.cnt_img_3 != null){
      dateStr += '\n3차 :'+item.cnt_date_3;
      imgStr += '\n3차 :'+item.cnt_img_3;
    }
    ws.cell(row,1).string((index+1).toString());
    ws.cell(row,2).string(item.osp_sname);
    ws.cell(row,3).string(item.cnt_mcp);
    ws.cell(row,4).string(item.cnt_cp);
    ws.cell(row,5).string(item.cnt_title);
    ws.cell(row,6).string(item.k_title);
    ws.cell(row,7).string(item.title);
    ws.cell(row,8).string(item.cnt_num);
    ws.cell(row,9).string((item.cnt_price == null) ? '':item.cnt_price.toString());
    ws.cell(row,10).string((item.cnt_writer == null) ? '':item.cnt_writer);
    ws.cell(row,11).string(dateStr);
    ws.cell(row,12).string('');
    ws.cell(row,13).string(item.cnt_url);
    ws.cell(row,14).string(imgStr);
  });

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_result_'+today+'.xlsx';
  var filepath = aDir+filename;
  wb.write(filepath,function(err,stats){
    if(err){
      console.log(err);
    }
    else{
      res.setHeader("Content-Type", "application/x-msdownload");
      res.setHeader("Content-Disposition", "attachment; filename=" + filename);

      var filestream = fs.createReadStream(filepath);
      fs.unlink(filepath,function(err){
        if(err) return console.log(err);
        console.log('file deleted successfully');
      });
      filestream.pipe(res);
    }
  });
});

router.get('/:type/image',async function(req, res) {
  var zip = new require('node-zip')();
  var typeVal = (req.params.type == 'alliance')? '1':'0';
  console.log(req.params.type);
  console.log(typeVal);
  var list1 = await monitoring.selectImage(req.query,[typeVal],'1');
  var list2 = await monitoring.selectImage(req.query,[typeVal],'2');
  var list3 = await monitoring.selectImage(req.query,[typeVal],'3');
  var list = list1.concat(list2).concat(list3);

  var count = 0;
  await asyncForEach(list, async (item, index, array) => {
    try {
      // zip.file(item.cnt_img_name, fs.readFileSync(aDir+'/public/monitoring_img'+item.path+'/'+item.cnt_img_name));
      var fResult = fs.readFileSync(aDir+'/public/monitoring_img'+item.cnt_img_name);
      zip.file(item.cnt_img_name,fResult);
      count += 1;
    } catch (e) {
        console.log('file ERROR : ',e);
    }
  });
  console.log('count : ',count);
  if(count == 0){
    res.redirect('http://otogreen.co.kr/monitoring/'+req.params.type+'?z-result=false');
    return false;
  }

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_images_'+today+'.zip';
  var filepath = aDir+filename;

  try {
    var data = zip.generate({base64:false, compression:'DEFLATE'});
    fs.writeFileSync(filename, data, 'binary');
    res.setHeader("Content-Type", "application/x-msdownload");
    res.setHeader("Content-Disposition", "attachment; filename=" + filename);
  } catch (e) {
    res.redirect('http://otogreen.co.kr/monitoring/'+req.params.type+'?z-result=zipError');
    console.log('zip Error :',e);
  }

  var filestream = fs.createReadStream(filepath);
  fs.unlink(filepath,function(err){
    if(err) return console.log(err);
    console.log('zip file deleted successfully');
  });
  filestream.pipe(res);
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  // 키워드 필터링 리스트
  var result = await monitoring.delete('cnt_f_list',{'n_idx':req.body.idx});
  console.log(result);
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  // 키워드 필터링 상세 리스트
  result = await monitoring.delete('cnt_f_detail',{'f_idx':req.body.idx});
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  // 2, 3차 모니터링 리스트
  result = await monitoring.delete('go_site',{'cnt_url':req.body.url});
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  // 이미지 채증 리스트
  result = await monitoring.delete('go_img',{'cnt_url':req.body.url});
  if(!('protocol41' in result)){
    res.status(500);
    return false;
  }
  res.send(true);
});

router.post('/getInfo',isAuthenticated,async function(req, res, next) {
  // 키워드 필터링 리스트
  var result = await monitoring.getInfo(req.body.idx);
  res.send(result);
});

async function getListPageData(type,param){
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  dt.offsetInDays(-7);
  var start = dt.format('Y-m-d');

  var data = {
    pType:type,
    list:[],
    listCount:{total:0},
    cp:'',
    mcp:'',
    searchType:'',
    search:'',
    page:1,
    sDate:start,
    eDate:end
  };
  var limit = 20;
  // sql qeury ? 파라미터 : osp_tstate,limit
  var typeVal = (type == 'alliance')? '1':'0';
  var searchParam = [typeVal,0,limit];
  var currentPage = 1;
  var searchBody = {sDate:start,eDate:end};
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
    if(user.U_class == 'a' && param.type == 'selectMCP'){
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

const aPath = 'D:/webhard/autogreen/';
var fs_extra = require('fs-extra');
async function mkdirsFun(directory) {
  try {
    await fs_extra.ensureDir(directory)
    return directory;
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

var multer = require('multer');
var storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    var date = datetime.create();
    var today = date.format('Y-m-d');
    await mkdirsFun(aPath+'public/monitoring_img/'+today);

    cb(null, 'public/monitoring_img/'+today) // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});

var upload = multer({ storage: storage });
router.post('/imageUpload', upload.single('file'), function(req, res){
  console.log('-imageUpload-');
  if (!req.file) {
    console.log("No file passed");
    return res.send(false);
  }
  res.send({
    filePath : req.file.path,
    fileName : req.file.filename
  });
});

module.exports = router;
