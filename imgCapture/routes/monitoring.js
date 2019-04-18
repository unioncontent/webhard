const logger = require('../winston/config_f.js');
﻿var express = require('express');
var xl = require('excel4node');
var datetime = require('node-datetime');
var fs = require('fs');

var router = express.Router();

var monitoring = require('../models/monitoring.js');

const aDir = 'D:/otogreen/server/';
router.get('/:type/excel',async function(req, res) {
  logger.info('excel req.query :',req.query);
  var typeVal = (req.params.type == 'alliance')? '1':(req.params.type == 'nalliance') ?'0':(req.params.type == 'all') ?'4':'3';
  if(typeVal == '4'){
    if('tstate' in req.query){
      typeVal = req.query.tstate;
    }
  }
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
  ws.cell(1,8).string('파일명').style(tStyle);
  ws.cell(1,9).string('게시물번호').style(tStyle);
  ws.cell(1,10).string('판매금액').style(tStyle);
  ws.cell(1,11).string('판매자').style(tStyle);
  ws.cell(1,12).string('용량').style(tStyle);
  ws.cell(1,13).string('검출일').style(tStyle);
  ws.cell(1,14).string('채증시간').style(tStyle);
  ws.cell(1,15).string('URL').style(tStyle);
  ws.cell(1,16).string('채증이미지').style(tStyle);
  var row = 0;
  await asyncForEach(list, async (item, index, array) => {
    row = index+2;
    // var dateStr = (item.cnt_regdate == null) ? '':item.cnt_regdate;
    // var dateArr = dateStr.split(',');
    // if(dateArr.length == 3){
    var dateStr = item.cnt_date_1;
    var imgStr = '';
    if(item.cnt_img_1 != '/untitled.jpg' && item.cnt_img_1 != null){
      // dateStr = '1차 :'+dateArr[0]+', 2차 :'+dateArr[1]+', 3차 :'+dateArr[2];
      // dateStr += '1차 :'+item.cnt_date_1;
      // imgStr += '1차 :'+item.cnt_img_1;
      // dateStr += item.cnt_date_1;
      imgStr += item.cnt_img_1.split('/')[2];
    }
    if(req.params.type != 'all'){
      // else if(dateArr.length == 2){
      if(item.cnt_img_2 != '/untitled.jpg' && item.cnt_img_2 != null){
        // dateStr += '\n2차 :'+item.cnt_date_2;
        // imgStr += '\n2차 :'+item.cnt_img_2;
        dateStr += '/'+item.cnt_date_2;
        imgStr += '/'+item.cnt_img_2.split('/')[2];
      }
    // else if(dateArr.length == 1){
      if(item.cnt_img_3 != '/untitled.jpg'  && item.cnt_img_3 != null){
        // dateStr += '\n3차 :'+item.cnt_date_3;
        // imgStr += '\n3차 :'+item.cnt_img_3;
        dateStr += '/'+item.cnt_date_3;
        imgStr += '/'+item.cnt_img_3.split('/')[2];
      }
    }
    ws.cell(row,1).string((index+1).toString());
    ws.cell(row,2).string(item.osp_sname);
    ws.cell(row,3).string(item.cnt_mcp);
    ws.cell(row,4).string(item.cnt_cp);
    ws.cell(row,5).string(item.cnt_title);
    ws.cell(row,6).string(item.k_title);
    ws.cell(row,7).string(item.title);
    ws.cell(row,8).string(item.cnt_fname);
    ws.cell(row,9).string(item.cnt_num);
    ws.cell(row,10).string((item.cnt_price == null) ? '':item.cnt_price.toString());
    ws.cell(row,11).string((item.cnt_writer == null) ? '':item.cnt_writer);
    ws.cell(row,12).string((item.cnt_vol == null) ? '':item.cnt_vol);
    ws.cell(row,13).string(dateStr);
    ws.cell(row,14).string('');
    ws.cell(row,15).string(item.cnt_url);
    ws.cell(row,16).string(imgStr);
  });

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_result_'+today+'.xlsx';
  var filepath = aDir+filename;
  wb.write(filepath,function(err,stats){
    if(err){
      logger.info(err);
    }
    else{
      res.setHeader("Content-Type", "application/x-msdownload");
      res.setHeader("Content-Disposition", "attachment; filename=" + filename);

      var filestream = fs.createReadStream(filepath);
      fs.unlink(filepath,function(err){
        if(err) return logger.info(err);
        logger.info('file deleted successfully');
      });
      filestream.pipe(res);
    }
  });
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

router.get('/:type/mExcel',async function(req, res) {
  logger.info('mExcel:',req.params);
  var typeVal = (req.params.type == 'cnts' || req.params.type == 'cnt')? '콘텐츠':'osp';
  var datetime = require('node-datetime');
  var dt = datetime.create();
  var end = dt.format('Y-m-d');
  dt.offsetInDays(-2);
  var start = dt.format('Y-m-d');

  var data = {
    list:[],
    cp:'',
    mcp:'',
    oc:'0',
    sDate: start,
    eDate: end
  };
  var limit = 20;
  var searchParam = ['0','',data.mcp,data.cp,'a.osp_sname',data.sDate,data.eDate,0,0,''];
  var param = req.query;

  if (typeof param.osp !== 'undefined') {
    data['osp'] = param.osp;
    searchParam[9] = data['osp'];
  }
  if (typeof param.oc !== 'undefined') {
    data['oc'] = param.oc;
    searchParam[0] = data['oc'];
    searchParam[4] = (data['oc'] == '1'? 'a.cnt_title': 'a.osp_sname');
  } else if (typeVal == '콘텐츠'){
    data['oc'] = '1';
    searchParam[0] = data['oc'];
    searchParam[4] = (data['oc'] == '1'? 'a.cnt_title': 'a.osp_sname');
  }
  if (typeof param.sDate !== 'undefined' && typeof param.eDate !== 'undefined') {
    data['sDate'] = param.sDate;
    data['eDate'] = param.eDate;
    searchParam[5] = data['sDate']+' 00:00:00';
    searchParam[6] = data['eDate']+' 23:59:59';
  }
  if (typeof param.cp !== 'undefined') {
    data['cp'] = param.cp;
    searchParam[1] = 'c';
    searchParam[3] = data['cp'];
  } else if(data['cp'] != '') {
    searchParam[1] = 'c';
    searchParam[3] = data['cp'];
  }
  if (typeof param.mcp !== 'undefined') {
    data['mcp'] = param.mcp;
    searchParam[1] = 'm';
    searchParam[2] = data['mcp'];
  } else if(data['mcp'] != '') {
    searchParam[1] = 'm';
    searchParam[2] = data['mcp'];
  }
  logger.info(searchParam);
  var list = await monitoring.call_stats(searchParam);
  if(list.length < 0){
    res.status(500);
    return false;
  }
  var wb = new xl.Workbook({
    defaultFont: {
      size: 10,
      color: '#000000'
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      fgColor: '#FFFFFF'
    },
    alignment: {
      horizontal: 'center'
    },
    numberFormat: '#,##0;-'
  });
  var ws = wb.addWorksheet('sheet1');
  var border_data = {top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'}};
  var alignment_data = {horizontal: 'center',vertical:'center'};
  var tStyle = wb.createStyle({
    font: {
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      fgColor: '#ffeb3b',
    },
    alignment: alignment_data,
    border: border_data
  });
  var dStyle = wb.createStyle({
    alignment: alignment_data,
    border: border_data
  });

  ws.cell(1,1,2,1,true).string('NO').style(tStyle);
  ws.cell(1,2,2,2,true).string(typeVal).style(tStyle);
  ws.cell(1,3,2,3,true).string('제휴').style(tStyle);
  ws.cell(1,4,1,6,true).string('비제휴평가').style(tStyle);
  ws.cell(1,7,1,8,true).string('총검출').style(tStyle);
  ws.cell(1,9,1,10,true).string('제휴').style(tStyle);
  ws.cell(1,11,1,12,true).string('비제휴').style(tStyle);
  ws.cell(1,13,1,14,true).string('제휴전환').style(tStyle);
  ws.cell(1,15,1,16,true).string('삭제건수').style(tStyle);
  ws.cell(1,17,1,18,true).string('비제휴잔류').style(tStyle);
  ws.cell(2,4).string('평가').style(tStyle);
  ws.cell(2,5).string('점수').style(tStyle);
  ws.cell(2,6).string('총검출').style(tStyle);
  ws.cell(2,7).string('PC').style(tStyle);
  ws.cell(2,8).string('모바일').style(tStyle);
  ws.cell(2,9).string('PC').style(tStyle);
  ws.cell(2,10).string('모바일').style(tStyle);
  ws.cell(2,11).string('PC').style(tStyle);
  ws.cell(2,12).string('모바일').style(tStyle);
  ws.cell(2,13).string('PC').style(tStyle);
  ws.cell(2,14).string('모바일').style(tStyle);
  ws.cell(2,15).string('PC').style(tStyle);
  ws.cell(2,16).string('모바일').style(tStyle);
  ws.cell(2,17).string('PC').style(tStyle);
  ws.cell(2,18).string('모바일').style(tStyle);
  ws.cell(1,19,2,19,true).string('패널티').style(tStyle);

  var row = 0;
  await asyncForEach(list[0], async (item, index, array) => {
    row = index+3;
    ws.cell(row,1).string((index+1).toString()).style(dStyle);
    if(req.params.type == 'cnts'){
      ws.cell(row,2).string(item.cnt_title).style(dStyle);
    }
    else{
      ws.cell(row,2).string(item.osp_sname).style(dStyle);
    }
    ws.cell(row,3).string((item.osp_tstate == '1')? '제휴':'비제휴').style(dStyle);
    var naNum = (((Number(item.natotal.replace(/,/gi,''))+Number(item.m_natotal.replace(/,/gi,''))) / (Number(item.total.replace(/,/gi,''))+Number(item.m_total.replace(/,/gi,''))) ) * (Number(item.natotal.replace(/,/gi,''))+Number(item.m_natotal.replace(/,/gi,'')))).toFixed(1);

    var naStr = '-';
    if(naNum < 1){
      naStr='양호';
    } else if(naNum >= 1 && naNum < 30){
      naStr='주의';
    } else if(naNum >=30){
      naStr='경고';
    }
    ws.cell(row,4).string(naStr).style(dStyle);
    ws.cell(row,5).string((naNum == 'NaN') ? '0':naNum).style(dStyle);
    ws.cell(row,6).number((Number(item.total.replace(/,/gi,''))+Number(item.m_total.replace(/,/gi,'')))).style(dStyle);
    ws.cell(row,7).number(Number(item.total.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,8).number(Number(item.m_total.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,9).number(Number(item.atotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,10).number(Number(item.m_atotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,11).number(Number(item.natotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,12).number(Number(item.m_natotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,13).number(Number(item.d_atotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,14).number(Number(item.m_d_atotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,15).number(Number(item.d_dtotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,16).number(Number(item.m_d_dtotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,17).number(Number(item.d_natotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,18).number(Number(item.m_d_natotal.replace(/,/gi,''))).style(dStyle);
    ws.cell(row,19).number(Number(item.ptotal.replace(/,/gi,''))+Number(item.m_ptotal.replace(/,/gi,''))).style(dStyle);
  });
  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_monitoring_'+today+'.xlsx';
  var filepath = aDir+filename;
  wb.write(filepath,function(err,stats){
    if(err){
      logger.info(err);
    }
    else{
      res.setHeader("Content-Type", "application/x-msdownload");
      res.setHeader("Content-Disposition", "attachment; filename=" + filename);
      var filestream = fs.createReadStream(filepath);
      fs.unlink(filepath,function(err){
        if(err) return logger.info(err);
        logger.info('file deleted successfully');
      });
      filestream.pipe(res);
    }
  });
});

router.get('/:type/image_',async function(req, res) {
  var zip = new require('node-zip')();
  var typeVal = (req.params.type == 'alliance')? '1':(req.params.type == 'nalliance')?'0':'3';
  var list1 = await monitoring.selectImage(req.query,[typeVal],'1');
  // var list2 = await monitoring.selectImage(req.query,[typeVal],'2');
  // var list3 = await monitoring.selectImage(req.query,[typeVal],'3');
  // var list = list1.concat(list2).concat(list3);
  var list = list1;

  var count = 0;
  await asyncForEach(list, async (item, index, array) => {
    try {
      // zip.file(item.cnt_img_name, fs.readFileSync(aDir+'/public/monitoring_img'+item.path+'/'+item.cnt_img_name));
      // var fResult = fs.readFileSync(aDir+'/public/monitoring_img'+item.cnt_img_name);
      // zip.file(item.cnt_img_name,fResult);

      zip.file(item.cnt_img_name,fs.readFileSync(aDir+'/public/monitoring_img'+item.cnt_img_name));
      count += 1;
    } catch (e) {
        logger.info('file ERROR : ',e,aDir+'/public/monitoring_img'+item.cnt_img_name,item);
    }
  });

  await asyncForEach(list, async (item, index, array) => {
    try {
      zip.file(item.cnt_img_name,fs.readFileSync(aDir+'/public/monitoring_img'+item.cnt_img_name));
      count += 1;
    } catch (e) {
        logger.info('file ERROR : ',e,aDir+'/public/monitoring_img'+item.cnt_img_name,item);
    }
  });


  // logger.info('zip:',zip);
  logger.info('count : ',count);
  if(count == 0){
    res.redirect('http://otogreen.co.kr/monitoring/'+req.params.type+'?z-result=false');
    return false;
  }

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_images_'+today+'.zip';
  var filepath = aDir+filename;
  logger.info('filename:',filename);

  try {
    logger.info('zip.generate start');
    var data = zip.generate({base64:true, compression:'DEFLATE'});
    logger.info('zip.generate end');
    fs.writeFileSync(filename, data, 'binary');
    logger.info('filename : ',filename);
    res.setHeader("Content-Type", "application/x-msdownload");
    res.setHeader("Content-Disposition", "attachment; filename=" + filename);
  } catch (e) {
    res.redirect('http://otogreen.co.kr/monitoring/'+req.params.type+'?z-result=zipError');
    logger.info('zip Error :',e);
  }

  var filestream = fs.createReadStream(filepath);
  fs.unlink(filepath,function(err){
    if(err) return logger.info(err);
    logger.info('zip file deleted successfully');
  });
  filestream.pipe(res);
});

const JSZip = require("jszip");
router.get('/:type/image',async function(req, res) {
  logger.info('image-req.query :',req.query);
  var jszip = new JSZip();
  var typeVal = (req.params.type == 'alliance')? '1':(req.params.type == 'nalliance') ?'0':(req.params.type == 'all') ?'4':'3';
  if(typeVal == '4'){
    if('tstate' in req.query){
      typeVal = req.query.tstate;
    }
  }
  // var typeVal = (req.params.type == 'alliance')? '1':(req.params.type == 'nalliance')?'0':'3';
  var list1 = await monitoring.selectImage(req.query,[typeVal],'1');
  var list = list1;
  if(req.params.type != 'all'){
    var list2 = await monitoring.selectImage(req.query,[typeVal],'2');
    var list3 = await monitoring.selectImage(req.query,[typeVal],'3');
    list = list1.concat(list2).concat(list3);
  }
  // var list = list1;
  var count = 0;
  await asyncForEach(list, async (item, index, array) => {
    try {
      // zip.file(item.cnt_img_name,fs.readFileSync(aDir+'/public/monitoring_img'+item.cnt_img_name));
      // logger.info(item.cnt_img_name);
      var fileName = item.cnt_img_name.split('/')[2];
      jszip.file('/image/'+fileName,fs.readFileSync(aDir+'/public/monitoring_img'+item.cnt_img_name));
      count += 1;
    } catch (e) {
        logger.info('file ERROR : ',e,aDir+'/public/monitoring_img'+item.cnt_img_name,item);
    }
  });

  logger.info('count : ',count);
  if(count == 0){
    res.redirect('http://otogreen.co.kr/'+((req.params.type == 'all')? 'monitoring_w/all':req.params.type)+'?z-result=false');
    return false;
  }
  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_images_'+today+'.zip';
  var filepath = aDir+filename;

  try {
    logger.info('zip.generate start');
    // zip.generateAsync({type:"blob"}).then(function(content) {
    //   // see FileSaver.js
    //   logger.info('filename:',filename);
    //   saveAs(content, filename);
    // });
   //  zip.generateNodeStream({streamFiles:true})
   // .pipe(fs.createWriteStream(filename))
   // .on('finish', function () {
   //     logger.info(filename+" written.");
   //  });
   // jszip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
   // .pipe(fs.createWriteStream(filename))
   // .on('finish',async function () {
   //   logger.info('*filename:',filename);
   //   fs.readFile(filename,async function (err, data) {
   //     if (err) throw err;
   //     jszip.loadAsync(data).then(async function (zip) {
   //       logger.info('*zip:',zip);
   //     });
   //   });
   // });

   res.header('Content-Type', 'application/zip');
   res.header('Content-Disposition', 'attachment; filename="'+filename+'"');
   jszip.generateNodeStream({streamFiles: true, compression: 'STORE'}).pipe(res);
   logger.info('zip.generate end');


    // fs.writeFileSync(filename, data, 'binary');
    // res.setHeader("Content-Type", "application/x-msdownload");
    // res.setHeader("Content-Disposition", "attachment; filename=" + filename);
    // res.redirect('http://otogreen.co.kr/monitoring/'+req.params.type+'?z-result=false');
  } catch (e) {
    res.redirect('http://otogreen.co.kr/'+((req.params.type == 'all')? 'monitoring_w/all':req.params.type)+'?z-result=zipError');
    logger.info('zip Error :',e);
  }

  // var filestream = fs.createReadStream(filepath);
  // fs.unlink(filepath,function(err){
  //   if(err) return logger.info(err);
  //   logger.info('zip file deleted successfully');
  // });
  // filestream.pipe(res);
});

const aPath = 'D:/otogreen/server/';
var fs_extra = require('fs-extra');
async function mkdirsFun(directory) {
  try {
    await fs_extra.ensureDir(directory)
    return directory;
    logger.info('success!')
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
  try {
    if (!req.file) {
      logger.info("No file passed");
      return res.status(500).send('img');
    }
    const stats = fs.statSync(req.file.path)
    const fileSizeInBytes = stats.size
    // logger.info(fileSizeInBytes);
    if(fileSizeInBytes == 0){
      logger.info("이미지 저장안됨");
      return res.status(500).send('img');
    }
    res.send({
      filePath : req.file.path,
      fileName : req.file.filename
    });
  } catch (e) {
    logger.info('Error : ',e);
    logger.info('imageUpload : ',req.file.path);
    return res.status(500).send('img');
  }
});

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
   var done = await callback(array[index], index, array);
    if(done == false){
     break;
    }
  }
}

router.get('/test', function(req, res){
  try {

    //Convert the file size to megabytes (optional)
    const fileSizeInMegabytes = fileSizeInBytes / 1000000.0
    return res.send({'a':fileSizeInBytes,'b':fileSizeInMegabytes});
  } catch (e) {
    logger.info('Error : ',e);
    return res.send(false);
  }
});

module.exports = router;
