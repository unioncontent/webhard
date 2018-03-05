var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
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
    res.redirect('/login');
  }
  var searchObject = {
    cp_name: '0',
    offset: 0,
    limit: 10
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
          cList: result,
          totalUser: totalUser,
          pageCount: pageCount,
          currentPage: currentPage
        });
      }
    });
  });
});

router.post('/getCPList', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  User.getClassAllList('c', function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/update', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  if (req.body.type === undefined) {
    if (req.body.K_method == '0') {
      req.body.K_apply = 'P';
    }
    Keyword.updateKeyword(req.body, function(err, result) {
      if (err) throw err;
      res.send('true');
    });
  } else if (req.body.type == 'all') {
    delete req.body.type;
    Keyword.updateAllKeyword(req.body, function(err, result) {
      if (err) throw err;
      res.send('true');
    });
  }
});

router.post('/delete', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  Keyword.deleteKeyword(req.body.n_idx_c, function(err, result) {
    if (err) throw err;
    Contents.deleteContents(req.body.n_idx_c, function(err, result) {
      if (err) throw err;
      res.send('true');
    });
  });
});

router.get('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('contentsAdd');
});

router.post('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  var data = req.body;
  var promise = require('../db/db_promise.js');
  var DBpromise = new promise(global.osp);
  console.log("1 CP ID확인");
  DBpromise.userQuery('select * from user_all where U_id=? and U_class=\'c\'',data.U_id_c)
      .then(rows => {
        console.log("2 OSP ID확인");
        return DBpromise.userQuery('select * from user_all where U_id=? and U_class=\'o\'',data.OSP_id)
      }, err => {
        res.status(500).send('CP ID를 다시 확인해주세요.');
        return DBpromise.userClose().then(() => { throw err; })
      })
      .then(rows => {
        console.log("3 콘텐츠 ID 설정");
        return DBpromise.query('select n_idx+1 as idx from cnts_list_c order by CP_regdate desc limit 1');
      }, err => {
        console.log('ospId err 부분')
        res.status(500).send('OSP ID를 다시 확인해주세요.');
        return DBpromise.userClose().then(() => { throw err; })
      })
      .then(rows => {
        console.log("4 콘텐츠 추가");
        data.CP_CntID = data.U_id_c + '-' + data.OSP_id + '-' + rows[0].idx;
        var param = [data.CP_CntID,data.U_id_c,data.CP_title,data.CP_title_eng,data.CP_price,data.CP_hash];
        var sql = 'insert into cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
        return DBpromise.query(sql,param);
      }, err => {
        res.status(500).send('콘텐츠 등록이 실패했습니다.');
        return DBpromise.close().then(() => { throw err; })
      })
      .then(rows => {
        console.log("5 콘텐츠 확인");
        sql = 'select * from cnts_list_c order by CP_regdate desc limit 1';
        return DBpromise.query(sql);
      }, err => {
        res.status(500).send('콘텐츠 등록이 실패했습니다.');
        return DBpromise.close().then(() => { throw err; })
      })
      .then(rows => {
        console.log("6 키워드 추가");
        if(data.CP_CntID == rows[0].CP_CntID){
          data.n_idx_c = rows[0].n_idx;
          data.K_key = '1';
          data.K_type = '1';
          var param = [data.n_idx_c,data.U_id_c,data.keyword,data.K_apply,data.K_method,data.K_key,data.K_type];
          var sql = 'insert into cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, K_regdate) values(?,?,?,?,?,?,?,now())';
          console.log(sql,param);
          return DBpromise.query(sql,param);
        }
      }, err => {
        res.status(500).send('키워드 추가를 실패했습니다.');
        console.log("6-1 콘텐츠 삭제");
        Test.query('delete cnts_list_c where n_idx = ?',data.n_idx_c);
        return DBpromise.close().then(() => { throw err; })
      })
      .then(rows => {
        console.log(rows);
        DBpromise.userClose();
        DBpromise.close();
        res.send('콘텐츠 등록이 완료되었습니다.');
      })
      .catch(function (err) {
        console.log(err);
      });
});

var async = require('async');
var param = {};
var num = 0;
var tasks = [
  function (callback) {
    console.log("1 CP ID확인");
    var iData = param;
    User.checkOCId(['c', iData.U_id_c], function(err, results) {
      if (err || results.length == 0) {
        console.log('CP사를 다시 입력해 주세요.');
        callback('CP사를 다시 입력해 주세요.', 1);
      }
      callback(null, true, iData);
    });
  },
  function (check, data, callback) {
    console.log("2 OSP ID확인");
    if(check){
      User.checkOCId(['o', data.OSP_id], function(err, results) {
        if (err || results.length == 0) {
          console.log('OSP ID를 다시 입력해 주세요.');
          callback(err);
        }
        callback(null, data);
      });
    }
  },
  function (data, callback) {
    console.log("3 콘텐츠 ID 설정",data);
    Contents.getNextIdx(data, function(err, results) {
      if (err) {
        callback(err);
      }

      if(num == 0){
        num = Number(results[0].idx);
      }
      else {
        num += 1;
      }
      data.CP_CntID = data.U_id_c + '-' + data.OSP_id + '-' + num;
      callback(null, data);
    });
  },
  function (data, callback) {
    console.log("4 콘텐츠 추가");
    Contents.insertContents(data, function(err, results, fields) {
      if (err) {
        callback(err);
      }
      callback(null, data);
    });
  },
  function (data, callback) {
    console.log("5 콘텐츠 확인");
    Contents.checkInsert(data, function(err, results, fields) {
      if (err) {
        callback(err);
      }
      callback(null, results[0].n_idx, data);
    });
  },
  function (n_idx, data, callback) {
    console.log("6 키워드 추가");
    if (n_idx != "" && data.keyword != "") {
      data.n_idx_c = n_idx;
      data.K_key = '1';
      data.K_type = '1';
      Keyword.insertKeyword(data, function(err, results, fields) {
        if (err) {
          callback(err);
        }
        callback();
      });
    }
  }
];
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
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

router.post('/add/upload', upload.single('excel'), function(req, res){
  num = 0;
  if (!req.file) {
    res.json({
      error_code: 1,
      err_desc: "No file passed"
    });
    return;
  }
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
        return res.json({
          error_code: 1,
          err_desc: err,
          data: null
        });
      }
      var count = 0;
      async.forEach(result,function(item){
        param = {};
        var check = asyncInsert(item, null);
        if(count == result.length){
          res.redirect('/contents/add');
        }
        count += 1;
      });
    });
  } catch (e) {
    res.json({
      error_code: 1,
      err_desc: "Corupted excel file"
    });
  }
  var fs = require('fs');
  try {
    fs.unlinkSync(req.file.path);
  } catch(e) {
    console.log(e);
  }
});

function asyncInsert(data, res){
  param = {
    'U_id_c': data["cpid"],
    'CP_title': data["title"],
    'CP_title_eng': data["engtitle"],
    'OSP_id': data["ospid"],
    'K_method': data["method"],
    'K_apply': data["apply"],
    'CP_hash': data["hash"],
    'CP_price': (data["price"] == "") ? 0 : data["price"],
    'keyword': (data["keyword"] == "") ? data["title"] : data["keyword"]
  };
  try {
    async.waterfall(tasks, function (err) {
      if (err){
        console.log('err:',err);
        throw (new Error(err));
      }
      console.log('done');
      return true;
    });
  } catch (e) {
    return e;
  }
}

module.exports = router;
