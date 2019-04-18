const logger = require('../winston/config_f.js');
var express = require('express');
var router = express.Router();
var fs = require('fs');
// DB module
var contents = require('../models/contents.js');
var keyword = require('../models/keyword.js');

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
    var done = await callback(array[index], index, array);
    if(done == false){
      break;
    }
  }
}
// 저작권검색 엑셀 뽑기
const aDir = 'D:/otogreen/server/';
var xl = require('excel4node');
var datetime = require('node-datetime');
router.get('/cResultExcel',async function(req, res) {
  var list = await contents.selectBackup(req.query,[]);
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
  ws.cell(1,4).string('URL').style(tStyle);
  ws.cell(1,5).string('등록일').style(tStyle);
  var row = 0;
  await asyncForEach(list, async (item, index, array) => {
    row = index+2;
    ws.cell(row,1).string((index+1).toString());
    ws.cell(row,2).string(item.cnt_osp);
    ws.cell(row,3).string(item.cnt_title);
    ws.cell(row,4).string(item.cnt_url);
    ws.cell(row,5).string(item.date_time);
  });
  var date = datetime.create();
  var today = date.format('YmdHM');
  var filename = 'autogreen_copyright_'+today+'.xlsx';
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
var count = 0;
var totalCount = 0;
var multer = require('multer');
const aPath = 'D:/otogreen/server/';
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, aPath) // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});
var upload = multer({ storage: storage });
//엑셀 1열 값이 맞는지 확인
var compare = function(a){
	var i = 0, j;
  var b = [ 'cnt_mcp','cnt_cp','cnt_title','cnt_eng_title', 'cnt_director', 'cnt_nat','cnt_cate','cnt_cpid','cnt_period','cnt_price','cnt_hash','cnt_mureka','cnt_acom','k_key','k_state','k_apply','k_method','k_mailing'];
	if(Array.isArray(a)){
		if(a.length != b.length) return false;
		for(j = a.length ; i < j ; i++) if(!compare(a[i], b[i])) return false;
		return true;
	}
	return a === b;
};
// 콘텐츠 등록
router.post('/add/upload', upload.single('excel'), function(req, res){
  logger.info('/add/upload');
  count = 0;
  totalCount = 0;

  if (!req.file) {
    logger.info("No file passed");
    return res.redirect('http://otogreen.co.kr/cnts?upload=false&msg=1_NoFileError');
  }

  logger.info('/add/upload file : ',req.file);
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
        logger.info("exceltojson err:",err);
        return res.redirect('http://otogreen.co.kr/cnts?upload=false&msg=1_ExcelSysError');
      }
      totalCount = result.length;
      res.redirect('http://otogreen.co.kr/cnts?upload=true&msg=wait');
      asyncForEach(result, async (item, index, array) => {
        // if(index == 0){
        //   var headerCheck = await compare(Object.keys(array[0]));
        //   if(!headerCheck){
        //     res.redirect('/cnts?upload=false&msg=1_ExcelHeaderError');
        //     return false;
        //   }
        // }

        // logger.info("each", item);
        item['k_title'] = (item["k_title"] != '') ? item["k_title"] : item["cnt_title"];
        if(item["cnt_title"] == '' || item["cnt_price"] == ''){
          // data는 없고 배열 마지막이라면
          if((index+1) == totalCount){
            res.redirect('http://otogreen.co.kr/cnts?upload=true');
            return true;
          }
          return 'notData';
        }

        var returnValue = await addContents(item);
        logger.info('addContents:',returnValue);
        logger.info('count:',count);
        logger.info('totalCount:',totalCount);
        if(returnValue[0] && count == totalCount){
          logger.info('성공');
          return true;
        }
        else if(returnValue[0] == false){
          logger.info('실패:'+count.toString()+'_'+returnValue[1]);
          res.redirect('http://otogreen.co.kr/cnts?upload=false&msg='+count.toString()+'_'+returnValue[1]);
          return false;
        }
      });
    });
  } catch (e) {
    logger.info("Corupted excel file err:",e);
    return res.redirect('http://otogreen.co.kr/cnts?upload=false&msg=1_ExcelSysError');
  }
  var fs = require('fs');
  try {
    fs.unlinkSync(req.file.path);
  } catch(e) {
    logger.info("uploads 파일 삭제 에러:",e);
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
    logger.info(count,'번 콘텐츠&키워드 insert 끝');
  } catch(error){
    logger.info(error);
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
