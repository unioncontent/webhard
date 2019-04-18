var express = require('express');
var router = express.Router();
var xl = require('excel4node');
var datetime = require('node-datetime');
var moment = require('moment');
var fs = require('fs');
// DB module
var osp = require('../../models/mcp/osp.js');
var calculate = require('../../models/mcp/calculate.js');

var isAuthenticated = function (req, res, next) {
  console.log('calculate 로그인확인:',req.isAuthenticated());
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.body);
  res.send({status:true,result:data});
});

router.post('/getOSPNextPage',isAuthenticated,async function(req, res, next) {
  console.log('getOSPNextPage');
  var data = await getOSPListPageData(req.body);
  data.ospList = await osp.selectOSPList_m(2);
  res.send({status:true,result:data});
});

async function getListPageData(param){
  var sDate = new Date();
  var eDate = new Date();
  sDate.setMonth(sDate.getMonth()-1);
  var start = sDate.getFullYear()+'-'+((sDate.getMonth()+1 < 10) ? '0'+(sDate.getMonth()+1):sDate.getMonth()+1);
  var end = eDate.getFullYear()+'-'+((eDate.getMonth()+1 < 10) ? '0'+(eDate.getMonth()+1):eDate.getMonth()+1);
  var data = {
    list:[],
    listCount:{total:0},
    sDate:start,
    eDate:end,
    page:1
  };
  var limit = 10;
  var searchParam = [0,limit];
  var currentPage = 1;
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[0] = (currentPage - 1) * limit
    data['offset'] = searchParam[0];
  }
  if('excel' in param){
    searchParam=[];
  }
  if (typeof param.sDate !== 'undefined') {
    if (typeof param.eDate !== 'undefined') {
      searchParam.unshift(param.eDate);
      searchParam.unshift(param.sDate);
      data['sDate'] = param.sDate;
      data['eDate'] = param.eDate;
    }
  }
  try{
    data['list'] = await calculate.acc_very_view(searchParam,(('mode' in param)?'detail':''));
    data['listCount'] = await calculate.acc_very_view_count(searchParam,(('mode' in param)?'detail':''));
    data.ospList = await osp.selectOSPList_m(2);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

async function getOSPListPageData(param){
  console.log('getOSPListPageData');
  var data = {
    list:[],
    listCount:{total:0},
    page:1
  };
  var limit = 10;
  var searchParam = [0,limit];
  var currentPage = 1;
  if (typeof param.page !== 'undefined') {
    currentPage = param.page;
    data['page'] = currentPage;
  }
  if (parseInt(currentPage) > 0) {
    searchParam[0] = (currentPage - 1) * limit
    data['offset'] = searchParam[0];
  }
  if('excel' in param){
    searchParam=[];
  }
  try{
    data['list'] = await calculate.acc_very_osp_view(searchParam);
    data['listCount'] = await calculate.acc_very_osp_view_count(searchParam);
  }
  catch(e){
    console.log(e);
  }
  return data;
}

const aDir = '/home/hosting_users/otogreen/apps/otogreen_oto/';
router.get('/excel',async function(req, res) {
  var list = await getListPageData(req.query);
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
  ws.cell(1,1).string('NO').style(tStyle);
  ws.cell(1,2).string('OSP').style(tStyle);
  ws.cell(1,3).string('제목').style(tStyle);
  ws.cell(1,4).string('가격').style(tStyle);
  ws.cell(1,5).string('구매/빌링').style(tStyle);
  ws.cell(1,6).string('결과').style(tStyle);
  var row = 0;
  console.log('list[list].length :',list['list'].length);
  await asyncForEach(list['list'], async (item, index, array) => {
    row = index+2;
    var perNum = Math.round(Number(item.billCount) / Number(item.buyCount) * 100);
    console.log(Number(item.billCount));
    console.log(Number(item.buyCount));
    console.log(Number(item.billCount) / Number(item.buyCount) * 100);
    console.log(perNum);
    ws.cell(row,1).string((index+1).toString());
    ws.cell(row,2).string(((item.osp_sname == null)? item.ACC_OSP_ID:item.osp_sname));
    ws.cell(row,3).string(item.ACC_Keyword);
    ws.cell(row,4).string(item.ACC_pay);
    ws.cell(row,5).string(item.buyCount+'/'+item.billCount);
    ws.cell(row,6).string(perNum+'%');
  });

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'otogreen_calculate_'+today+'.xlsx';
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
router.get('/excel2',async function(req, res) {
  var list = await getListPageData(req.query);
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
  ws.cell(1,1).string('NO').style(tStyle);
  ws.cell(1,2).string('OSP').style(tStyle);
  ws.cell(1,3).string('콘텐츠번호').style(tStyle);
  ws.cell(1,4).string('제목').style(tStyle);
  ws.cell(1,5).string('가격').style(tStyle);
  ws.cell(1,6).string('구매').style(tStyle);
  ws.cell(1,7).string('빌링정보').style(tStyle);
  ws.cell(1,8).string('상태').style(tStyle);
  var row = 0;
  console.log('list[list].length :',list['list'].length);
  await asyncForEach(list['list'], async (item, index, array) => {
    row = index+2;
    var perNum = Math.round(item.billCount / item.buyCount * 100);
    ws.cell(row,1).string((index+1).toString());
    ws.cell(row,2).string(((item.osp_sname == null)? item.ACC_OSP_ID:item.osp_sname));
    ws.cell(row,3).string(item.ACC_Cnt_Num);
    ws.cell(row,4).string(item.ACC_Cnt_Title);
    ws.cell(row,5).string(item.ACC_pay);
    ws.cell(row,6).string(item.ACC_Buy_Date_str);
    ws.cell(row,7).string(item.ACC_Admin_Date_str);
    ws.cell(row,8).string(((item.ACC_Admin_State == '0')?'없음':'정상'));
  });

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'otogreen_calculate_'+today+'.xlsx';
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

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
   var done = await callback(array[index], index, array);
    if(done == false){
     break;
    }
  }
}

router.post('/add/osp',isAuthenticated,async function(req, res, next) {
  var result = await calculate.insertOSP(req.body);
  res.send({status: true});
});

router.post('/delete',isAuthenticated,async function(req, res, next) {
  var result = await calculate.delete(req.body.n_idx);
  res.send({status: true});
});

router.post('/add',isAuthenticated,async function(req, res, next) {
  var result = await calculate.insert(req.body);
  res.send({status: true});
});

router.post('/add/search',isAuthenticated,async function(req, res, next) {
  var cntList = await calculate.selectCnt(req.body.search);
  res.send({list:cntList,status: true});
});

module.exports = router;
