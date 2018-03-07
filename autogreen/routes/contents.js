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

router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  var searchObject = {
    cp_name: req.body.cp_name || '0',
    offset: Number(req.body.start) || 0,
    limit: 10
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
          cList: result
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
  var result = addContents(req.body);
  console.log(result);
  res.send('콘텐츠 등록 완료.');
});

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
var count = 0;
var totalCount = 0;

router.post('/add/upload', upload.single('excel'), function(req, res){
  count = 0;totalCount = 0;
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
      var promises = [];
      var DBpromise = new promise(global.osp);
      result.forEach(function(item){
        var param = {
          'U_id_c': item["cpid"],
          'CP_title': item["title"],
          'CP_title_eng': item["engtitle"],
          'OSP_id': item["ospid"],
          'K_method': item["method"],
          'K_apply': item["apply"],
          'CP_hash': item["hash"],
          'CP_price': (item["price"] == "") ? 0 : item["price"],
          'keyword': (item["keyword"] == "") ? item["title"] : item["keyword"]
        };
        if(item.cpid == '' && item.title == ''){
          return false;
        }
        promises.push(addContents(param,DBpromise));
      });

      Promise.all(promises)
        .then(function(data){
          totalCount = data.length;
          res.redirect('/contents/add');
        })
        .catch(function(err){
          console.log('에러에러:',result);
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

function addContents(data,DBpromise){
  // console.log("1 CP ID확인\n","select * from user_all where U_id=? and U_class=?",[data.U_id_c,'c']);
  DBpromise.userQuery("select * from user_all where U_id=? and U_class=?",[data.U_id_c,'c'])
    .then(rows => {
      // console.log("2 OSP ID확인\n","select * from user_all where U_id=? and U_class=?",[data.OSP_id,'o']);
      if(rows == null){
        // console.log('row==null');
        throw new Error('error');
      }
      return DBpromise.userQuery("select * from user_all where U_id=? and U_class=?",[data.OSP_id,'o'])
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        throw new Error('error');
      }
      // console.log("3 콘텐츠 추가");
      var rNum = getRandomInt();
      data.CP_CntID = data.U_id_c + '-' + data.OSP_id + '-' + (rNum+1);
      var param = [data.CP_CntID,data.U_id_c,data.CP_title,data.CP_title_eng,data.CP_price,data.CP_hash];
      var sql = 'insert into cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
      return DBpromise.query(sql,param);
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        throw new Error('error');
      }
      // console.log("4 콘텐츠 확인");
      sql = 'select * from cnts_list_c where CP_title=? order by CP_regdate desc';
      // console.log(sql,data.CP_title);
      return DBpromise.query(sql,data.CP_title);
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        throw new Error('error');
      }
      // console.log("5 키워드 추가");
      if(data.CP_CntID == rows[0].CP_CntID){
        data.n_idx_c = rows[0].n_idx;
        data.K_key = '1';
        data.K_type = '1';
        var param = [data.n_idx_c,data.U_id_c,data.keyword,data.K_apply,data.K_method,data.K_key,data.K_type];
        var sql = 'insert into cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, K_regdate) values(?,?,?,?,?,?,?,now())';
        return DBpromise.query(sql,param);
      }
    }).catch(handleError)
    .then(rows => {
      console.log('끝끝');
      count+=1;
      // console.log(count);
      // console.log(totalCount);
      if(count == totalCount){
        DBpromise.userClose();
        DBpromise.close();
      }
      return true;
    }).catch(handleError);
}

function getRandomInt() {
  var min = 0;
  var max = 10000;
  return Math.floor(Math.random() * (max - min)) + min;
}

function handleError(err) {
  return -1;
}

module.exports = router;
