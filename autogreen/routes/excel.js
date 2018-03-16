var express = require('express');
var User = require('../models/user.js');
var Filtering = require('../models/filtering.js');
var Contents = require('../models/contents.js');
var fs = require('fs');
var xl = require('excel4node');
var moment = require('moment');
var router = express.Router();

const aDir = 'C:/Users/user/Documents/webhard/autogreen/';
// const bDir = 'C:/gitProject/webhard/autogreen/';

router.get('/', function(req, res, next) {
  req.body = {
    cp_name : '0'
  }
});

router.get('/contents', function(req, res, next) {
  Contents.getContentsList(req.query,function(err,result){
    if(err){
      res.status(500).send('다시 시도해주세요.\n'+err);
      return false;
    }
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
    var ws = wb.addWorksheet('Sheet 1');
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
    ws.column(4).setWidth(30);
    ws.column(7).setWidth(20);
    ws.cell(1,1).string('NO').style(tStyle);
    ws.cell(1,2).string('CP사').style(tStyle);
    ws.cell(1,3).string('CP관리ID').style(tStyle);
    ws.cell(1,4).string('제목').style(tStyle);
    ws.cell(1,5).string('관리현황').style(tStyle);
    ws.cell(1,6).string('상태').style(tStyle);
    ws.cell(1,7).string('등록일').style(tStyle);

    var row = 0;
    console.log('ContentsList:',result);
    result.forEach(function(item,idx){
      row = idx+2;
      var method = (item.K_method == '1')? '자동' : '수동';
      var key = (item.K_key == '1')? '검출' : '제외';
      ws.cell(row,1).string((idx+1).toString());
      ws.cell(row,2).string(item.CP_name);
      ws.cell(row,3).string(item.CP_cntID);
      ws.cell(row,4).string(item.CP_title);
      ws.cell(row,5).string(method);
      ws.cell(row,6).string(key);
      ws.cell(row,7).string(moment(item.CP_regdate).format('YYYY-MM-DD HH:mm:ss'));
    });
    var filename = 'autogreen_contents_'+moment().format('YYYYMMDD')+'.xlsx';
    wb.write(filename,function(err,stats){
      if(err){
        console.log(err);
      }
      else{
        var filepath = aDir+filename;
        res.setHeader('Content-Type', 'application/x-msdownload');
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
});

router.get('/filetering', function(req, res, next) {
  Filtering.getFilteringList(req.query,function(err,result){
    if(err){
      res.status(500).send('다시 시도해주세요.\n'+err);
      return false;
    }
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
      dateFormat: 'yyyy-mm-dd hh:mm:ss',
      numberFormat: '$#,##0;-'
    });
    var ws = wb.addWorksheet('Sheet 1');
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
    ws.column(4).setWidth(10);
    ws.column(5).setWidth(30);
    ws.column(7).setWidth(20);
    ws.column(8).setWidth(20);
    ws.cell(1,1).string('NO').style(tStyle);
    ws.cell(1,2).string('CP사').style(tStyle);
    ws.cell(1,3).string('게시물번호').style(tStyle);
    ws.cell(1,4).string('콘텐츠ID').style(tStyle);
    ws.cell(1,5).string('키워드').style(tStyle);
    ws.cell(1,6).string('제목').style(tStyle);
    ws.cell(1,7).string('금액').style(tStyle);
    ws.cell(1,8).string('등록일').style(tStyle);
    ws.cell(1,9).string('처리일').style(tStyle);
    ws.cell(1,10).string('관리상태').style(tStyle);

    var row = 0;
    console.log('FilteringList:',result);
    result.forEach(function(item,idx){
      row = idx+2;
      ws.cell(row,1).string((idx+1).toString());
      ws.cell(row,2).string(item.cp_name);
      ws.cell(row,3).string(item.osp_idx);
      ws.cell(row,4).string(item.cnt_id);
      ws.cell(row,5).string(item.K_keyword);
      ws.cell(row,6).string(item.title);
      ws.cell(row,7).number(Number(item.price));
      ws.cell(row,8).string(moment(item.createDate).format('YYYY-MM-DD HH:mm:ss'));
      ws.cell(row,9).string(moment(item.csDate).format('YYYY-MM-DD HH:mm:ss'));
      // ws.cell(row,7).date(new Date(item.createDate).toLocaleString('ko-kr', {timeZone: 'asia/seoul'}));
      // ws.cell(row,8).date(new Date(item.csDate).toLocaleString('ko-kr', {timeZone: 'asia/seoul'}));
      ws.cell(row,10).string(((item.k_method == '0')? '수동 - ' : '자동 - ')+((item.k_apply == 'T')? '제휴' : (item.k_apply == 'D')? '삭제' : '보류'));
    });
    var filename = 'autogreen_filtering_'+moment().format('YYYYMMDD')+'.xlsx';
    wb.write(filename,function(err,stats){
      if(err){
        console.log(err);
      }
      else{
        var filepath = aDir+filename;
        res.setHeader('Content-Type', 'application/x-msdownload');
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
});


module.exports = router;
