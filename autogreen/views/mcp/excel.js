var express = require('express');
var fs = require('fs');
var moment = require('moment');
var xl = require('excel4node');
var datetime = require('node-datetime');
var router = express.Router();
// DB module
var monitoring = require('../models/monitoring.js');

const aDir = 'C:/overware/overwareMail/';

router.get('/',async function(req, res) {
  var list = await monitoring.selectAll([req.query.idx,13]);
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
  await asyncForEach(sucess, async (item, index, array) => {
    row = index+2;
    ws.cell(row,1).string((index+1).toString());
    ws.cell(row,2).string(item.cnt_osp);
    ws.cell(row,3).string(item.cnt_mcp);
    ws.cell(row,4).string(item.cnt_cp);
    ws.cell(row,5).string(item.cnt_title);
    ws.cell(row,6).string(item.k_title);
    ws.cell(row,7).string(item.title);
    ws.cell(row,8).string(item.cnt_num);
    ws.cell(row,9).string(item.cnt_price);
    ws.cell(row,10).string(item.cnt_writer);
    ws.cell(row,11).string(item.go_regdate);
    ws.cell(row,12).string('');
    ws.cell(row,13).string(item.cnt_url);
    ws.cell(row,14).string(item.cnt_img_name);
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

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
   var done = await callback(array[index], index, array);
    if(done == false){
     break;
    }
  }
}

module.exports = router;
