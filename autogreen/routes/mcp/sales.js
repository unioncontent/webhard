var express = require('express');
var router = express.Router();
var xl = require('excel4node');
var datetime = require('node-datetime');
var moment = require('moment');
var fs = require('fs');
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
  var data = await getListPageData(req.query,req.user);
  data.ospList = await osp.selectOSPList_m(2);
  data.mcpList = await contents.getMCPList('m');
  res.render('mcp/sales',data);
});

router.post('/detail',isAuthenticated,async function(req, res, next) {
  var data = {
    list:[],
    listCount:{total:0},
    page:req.body.page
  };
  req.body.limit = Number(req.body.limit);
  req.body.offset = Number(req.body.offset);
  data['list'] = await sales.selectDetail(req.body);
  data['listCount'] = await sales.selectDetailCount(req.body);
  res.send({status:true,result:data});
});

router.post('/getNextPage',isAuthenticated,async function(req, res, next) {
  var data = await getListPageData(req.body,req.user);
  res.send({status:true,result:data});
});

async function getListPageData(param,user){
  var sDate = new Date();
  var eDate = new Date();
  sDate.setMonth(sDate.getMonth()-5);
  var start = sDate.getFullYear()+'-'+((sDate.getMonth()+1 < 10) ? '0'+(sDate.getMonth()+1):sDate.getMonth()+1);
  var end = eDate.getFullYear()+'-'+((eDate.getMonth()+1 < 10) ? '0'+(eDate.getMonth()+1):eDate.getMonth()+1);
  var data = {
    graph:[],
    list:[],
    cp:'0',
    mcp:'0',
    osp:'0',
    sDate:start,
    eDate:end
  };
  var searchParam = [data.mcp,data.cp,data.osp,data.sDate,data.eDate];
  if (typeof param.mcp !== 'undefined') {
    searchParam[0] = param.mcp;
    data['mcp'] = param.mcp;
  }
  // else if(data['mcp'] != '') {
  //   searchParam[0] = data['mcp'];
  // }

  if (typeof param.cp !== 'undefined') {
    searchParam[1] = param.cp;
    data['cp'] = param.cp;
  }
  // else if(data['cp'] != '') {
  //   searchParam[1] = data['cp'];
  // }

  if (typeof param.osp !== 'undefined') {
    searchParam[2] = param.osp;
    data['osp'] = param.osp;
  }
  if (typeof param.sDate !== 'undefined') {
    if (typeof param.eDate !== 'undefined') {
      searchParam[3] = param.sDate;
      searchParam[4] = param.eDate;
      data['sDate'] = param.sDate;
      data['eDate'] = param.eDate;
    }
  }

  try{
    // call_sales
    var result = await sales.call_sales(searchParam);
    data['graph'] = JSON.stringify(result[0]);
    data['list'] = ((result[1].length == 0)?[]:result[1]);
    data['totalResult'] = result[2][0];
  }
  catch(e){
    console.log(e);
  }
  return data;
}

const aDir = 'C:/gitProject/webhard/autogreen/';
router.get('/excel',async function(req, res) {
  var list = {};
  if('type' in req.query){
    list['list'] = await sales.selectDetail(req.query);
  }
  else{
    list = await getListPageData(req.query,req.user);
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
  ws.cell(1,2).string('정산일').style(tStyle);
  ws.cell(1,3).string('OSP').style(tStyle);
  ws.cell(1,4).string('총매출').style(tStyle);
  ws.cell(1,5).string('정산매출').style(tStyle);
  ws.cell(1,6).string('총판매건').style(tStyle);
  var row = 0;
  await asyncForEach(list['list'], async (item, index, array) => {
    row = index+2;
    ws.cell(row,1).string((index+1).toString());
    if(!('type' in req.query)){
      ws.cell(row,2).string(((req.query.sDate == req.query.eDate) ? req.query.sDate:(req.query.sDate+' ~ '+req.query.eDate)));
    }
    else{
      ws.cell(row,2).string(item.s_settlement_date);
    }
    ws.cell(row,3).string(item.s_osp);
    ws.cell(row,4).string(item.s_total_money);
    ws.cell(row,5).string(item.s_settlement_money);
    ws.cell(row,6).string(item.s_total_sales);
  });

  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'otogreen_sales_'+today+'.xlsx';
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
