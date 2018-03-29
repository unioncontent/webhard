var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
var promise = require('../db/db_promise.js');
var router = express.Router();

// 페이징
var totalUser = 0;
var pageCount = 0;
var currentPage = 1;

// 검색
var searchType = 'i';
var search = '';

router.get('/', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  var searchObject = {
    cp_name: '0',
    offset: 0,
    limit: 40
  }
  if (typeof req.query.cp_name !== 'undefined') {
    searchObject.cp_name = req.query.cp_name;
  }
  if (typeof req.query.searchType !== 'undefined') {
    searchObject.searchType = req.query.searchType;
  }
  if (typeof req.query.search !== 'undefined') {
    searchObject.search = req.query.search;
  }

  Contents.contentsCount(searchObject, function(err, result) {
    if (err) throw err;
    totalUser = result[0].total;
    pageCount = Math.ceil(totalUser / searchObject.limit);

    if (typeof req.query.page !== 'undefined') {
      currentPage = req.query.page;
    } else {
      currentPage = 1
    }

    if (parseInt(currentPage) > 0) {
      searchObject.offset = (currentPage - 1) * searchObject.limit;
    }

    Contents.getContentsList(searchObject, function(err, result) {
      if (err) {
        res.json(err);
      } else {
        res.render('contents', {
          data: searchObject,
          cList: result || [],
          totalUser: totalUser,
          pageCount: pageCount,
          currentPage: currentPage
        });
      }
    });
  });
});

router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  var searchObject = {
    cp_name: req.body.cp_name || '0',
    offset: Number(req.body.start) || 0,
    limit: 40
  }
  console.log(req.body);
  if('searchType' in req.body){
    searchObject.searchType = req.body.searchType;
    searchObject.search = req.body.search;
  }
  var currentPage = req.body.start;
  Contents.contentsCount(searchObject, function(err, result) {
    if (err) throw err;
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);
    Contents.getContentsList(searchObject, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.send({
          total: total,
          data: searchObject,
          pageCount: pageCount,
          cList: result || []
        });
      }
    });
  });
});

router.post('/getCPList', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  User.getCpAllList(function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/update', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  if(req.body.type == 'all'){
    Keyword.updateCpKeyKeyword(req.body, function(err, result) {
      if (err){
        res.status(500).send('다시시도해주세요.');
        throw err;
      }
      console.log(req.body)
      res.send(req.body);
    });
  }
  else{
    Keyword.updateKeyword(req.body, function(err, result) {
      if (err){
        res.status(500).send('다시시도해주세요.');
        throw err;
      }
      res.send(req.body);
    });
  }
});

router.post('/updateOne', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  Keyword.updateOneKeyword(req.body, function(err, result) {
    if (err){
      res.status(500).send('다시시도해주세요.');
      throw err;
    }
    res.send(req.body);
  });
});

router.post('/delete', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  Keyword.deleteKeyword([req.body.n_idx_c,'c_idx'], function(err, result) {
    if (err) throw err;
    Contents.deleteContents(req.body.n_idx_c, function(err, result) {
      if (err) throw err;
      res.send('true');
    });
  });
});

router.get('/add', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  res.render('contentsAdd');
});

router.post('/add', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }

  var aData = req.body;
  aData.CP_CntID = aData.U_id_c + '-' + aData.OSP_id + '-' + (getRandomInt()+1);
  var sql = 'insert into cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
  var param = [aData.CP_CntID,aData.U_id_c,aData.CP_title,aData.CP_title_eng,aData.CP_price,aData.CP_hash];

  console.log("1. 콘텐츠 추가");
  console.log(sql,param);
  var DBpromise = new promise(global.osp);
  DBpromise.query(sql,param)
    .then(rows => {
      if(rows == null){
        res.status(500).send('콘텐츠 등록이 실패했습니다.');
        throw new Error('error');
      }
      sql = 'select * from cnts_list_c where CP_title=? order by CP_regdate desc';
      console.log("2. 콘텐츠 확인");
      console.log(sql,param);
      return DBpromise.query(sql,aData.CP_title);
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        res.status(500).send('키워드 등록 중 에러가 났습니다.');
        throw new Error('error');
      }
      if(aData.CP_CntID == rows[0].CP_CntID){
        aData.n_idx_c = rows[0].n_idx;
        aData.K_key = '1';
        aData.K_type = '1';
        param = [aData.n_idx_c,aData.U_id_c,aData.keyword,aData.K_apply,aData.K_method,aData.K_key,aData.K_type,aData.delay_time];
        sql = 'insert into cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, delay_time, K_regdate) values(?,?,?,?,?,?,?,?,now())';
        console.log("3. 키워드 추가");
        console.log(sql,param);
        return DBpromise.query(sql,param);
      }
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        res.status(500).send('키워드 추가가 실패했습니다.');
        throw new Error('error');
      }
      res.send('콘텐츠등록이 완료되었습니다.');
    }).catch(handleError);

});

router.post('/add/cpCheck', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  User.checkName([req.body.CP_name,'c'],function(err,result){
    if(err){
      res.status(500).send('cp사 확인 중 에러가 났습니다.');
    }
    if(result != []){
      res.send(result);
    } else{
      res.status(500).send('해당 cp사가 등록되지 않았습니다.');
    }
  });
});

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

async function asyncForEach(array, callback) {
  for (var index = 0; index < array.length; index++) {
    var done = await callback(array[index], index, array);
    if(done == false){
      break;
    }
  }
}
//엑셀 1열 값이 맞는지 확인
var compare = function(a){
	var i = 0, j;
  var b = ['cpname','title','engtitle','ospid','method','apply','delaytime','hash','price','keyword'];
	if(Array.isArray(a)){
		if(a.length != b.length) return false;
		for(j = a.length ; i < j ; i++) if(!compare(a[i], b[i])) return false;
		return true;
	}
	return a === b;
};

router.post('/add/upload', upload.single('excel'), function(req, res){
  if(!req.user){
    return res.redirect('/login');
  }
  count = 0;
  totalCount = 0;

  if (!req.file) {
    console.log("No file passed");
    return res.redirect('/contents/add?upload=false&msg=1_NoFileError');
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
        return res.redirect('/contents/add?upload=false&msg=1_ExcelSysError');
      }
      totalCount = result.length;
      asyncForEach(result, async (item, index, array) => {
        if(index == 0){
          console.log(Object.keys(array[0]));
          var headerCheck = await compare(Object.keys(array[0]));
          if(!headerCheck){
            res.redirect('/contents/add?upload=false&msg=1_ExcelHeaderError');
            return false;
          }
        }
        // console.log("each", item);
        var param = {
          'CP_name': item["cpname"],
          'CP_title': item["title"],
          'CP_title_eng': item["engtitle"],
          'OSP_id': item["ospid"],
          'K_method': item["method"],
          'K_apply': (item["method"] == '0') ? 'P' : item["apply"],
          'delay_time': item["delaytime"] || 0,
          'CP_hash': item["hash"],
          'CP_price': (item["price"] == "") ? 0 : item["price"],
          'keyword': (item["keyword"] == "") ? item["title"] : item["keyword"]
        };
        if(param["CP_name"] == '' || param["CP_title"] == '' || param["OSP_id"] == ''){
          // data는 없고 배열 마지막이라면
          if((index+1) == totalCount){
            res.redirect('/contents/add?upload=true');
            return true;
          }
          return 'notData';
        }
        else if(param["OSP_id"] != global.osp){
          res.redirect('/contents/add?upload=false&msg=1_OSPIdError');
          return false;
        }
        var returnValue = await addContents(param);
        // console.log('check1:',returnValue[0] && count == totalCount);
        // console.log('check2:',returnValue[0] == false);
        console.log('addContents:',returnValue);
        console.log('count:',count);
        console.log('totalCount:',totalCount);
        if(returnValue[0] && count == totalCount){
          res.redirect('/contents/add?upload=true');
          return true;
        }
        else if(returnValue[0] == false){
          res.redirect('/contents/add?upload=false&msg='+count.toString()+'_'+returnValue[1]);
          return false;
        }
      });
    });
  } catch (e) {
    console.log("Corupted excel file err:",e);
    return res.redirect('/contents/add?upload=false&msg=1_ExcelSysError');
  }
  var fs = require('fs');
  try {
    fs.unlinkSync(req.file.path);
  } catch(e) {
    console.log("uploads 파일 삭제 에러:",e);
  }
});

async function addContents(data){
  var DBpromise = new promise(global.osp);
  try{
    try{
      var sql = "select * from user_all_b where U_name=? and U_class=?";
      var rows = await DBpromise.query(sql,[data.CP_name,'c']);
      // console.log("1 CP사 확인");
      // console.log(rows);
      data.U_id_c = rows[0].U_id;
    } catch(err){
      console.log(err);
      if(err==null){
        throw new Error('CPNameError');
      }
    }

    var rNum = getRandomInt();
    data.CP_CntID = data.U_id_c + '-' + data.OSP_id + '-' + (rNum+1);

    var param = [data.CP_CntID,data.U_id_c,data.CP_title,data.CP_title_eng,data.CP_price,data.CP_hash];
    sql = 'insert into cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
    rows = await DBpromise.query(sql,param);
    // console.log("2 콘텐츠 추가");
    // console.log(rows);
    try{
      sql = 'select * from cnts_list_c where CP_title=? order by CP_regdate desc';
      rows = await DBpromise.query(sql,data.CP_title);
      // console.log("3 콘텐츠 확인");
      // console.log(rows);
    } catch(err){
      console.log(err);
      if(err==null){
        throw new Error('CntListInsertError');
      }
    }

    if(data.CP_CntID == rows[0].CP_CntID){
      data.n_idx_c = rows[0].n_idx;
      data.K_key = '1';
      data.K_type = '1';
      param = [data.n_idx_c, data.U_id_c, data.keyword, data.K_apply, data.K_method, data.K_key, data.K_type, data.CP_hash, parseInt(data.delay_time)];
      try{
        sql = 'insert into cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, K_hash, delay_time, K_regdate) value(?,?,?,?,?,?,?,?,?,now())';
        rows = await DBpromise.query(sql,param);
        // console.log("4 키워드 추가");
        // console.log(rows);
      } catch(err){
        console.log(err);
        sql = 'delete from cnts_list_c where n_idx=?';
        rows = await DBpromise.query(sql,data.n_idx_c);
        throw new Error('KwdInsertError');
      }
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
    DBpromise.close();
  }
  return [true,'콘텐츠 등록 성공'];
}

function getRandomInt() {
  var min = 0;
  var max = 10000;
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = router;
