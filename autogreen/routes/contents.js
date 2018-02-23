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
    cpId: '0',
    offset: 0,
    limit: 10
  }
  if (typeof req.query.cpId !== 'undefined') {
    searchObject.cpId = req.query.cpId;
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
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('contentsAdd')
});

// var async = require('async');
// const asyncHandler = require('express-async-handler');
// router.post('/add', asyncHandler(async (req, res, next) => {
//   const result = await asyncInsert(req.body);
//   console.log(result);
//   res.send(result);
// }));
router.post('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  // asyncInsert(req.body);
  // res.send(true);
  var data = req.body;
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
  async.waterfall(tasks, function (err) {
    if (err){
      console.log('err:',err);
      res.status(500).send(err);
    }
    else{
      console.log('done');
      res.send('콘텐츠 등록이 완료되었습니다.');
    }
  });
  // CP ID확인
  // User.checkOCId(['c', req.body.U_id_c], function(err, results) {
  //   if (err || results.length == 0) {
  //     res.status(500).send('CP사를 다시 입력해 주세요.');
  //     return false;
  //   }
  //   // OSP ID확인
  //   User.checkOCId(['o', req.body.OSP_id], function(err, results) {
  //     if (err || results.length == 0) {
  //       res.status(500).send('OSP ID를 다시 입력해 주세요.');
  //       return false;
  //     }
  //     // 콘텐츠 ID 설정
  //     Contents.getNextIdx(req.body, function(err, results, fields) {
  //       if (err) {
  //         res.status(500).send('다시 입력해 주세요.');
  //         return false;
  //       }
  //       req.body.CP_CntID = req.body.U_id_c + '-' + req.body.OSP_id + '-' + results[0].idx;
  //       // 콘텐츠 추가
  //       Contents.insertContents(req.body, function(err, results, fields) {
  //         if (err) {
  //           res.status(500).send('다시 입력해 주세요.');
  //           return false;
  //         }
  //         var kParam = req.body;
  //         if (results[0].n_idx != "" && kParam.keyword != "") {
  //           kParam.n_idx_c = results[0].n_idx;
  //           kParam.K_key = '1';
  //           kParam.K_type = '1';
  //           // 키워드 추가
  //           Keyword.insertKeyword(kParam, function(err, results, fields) {
  //             if (err) {
  //               res.status(500).send('다시 입력해 주세요.');
  //               return false;
  //             }
  //             res.send('콘텐츠 등록이 완료되었습니다.');
  //           });
  //         }
  //       });
  //     });
  //   });
  // });
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

var param = {};
var num = 0;
var tasks = [
  function (callback) {
    console.log("1 CP ID확인:",param.CP_title);
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
    console.log("2 OSP ID확인:",data.CP_title);
    if(check){
      User.checkOCId(['o', data.OSP_id], function(err, results) {
        if (err || results.length == 0) {
          console.log('OSP ID를 다시 입력해 주세요.');
          callback('OSP ID를 다시 입력해 주세요.');
        }
        callback(null, data);
      });
    }
  },
  function (data, callback) {
    console.log("3 콘텐츠 ID 설정:",data.CP_title);
    Contents.getNextIdx(data, function(err, results, fields) {
      if (err) {
        callback('다시 입력해 주세요.');
      }
      if (num == 0){
        num = results[0].idx;
      }
      else{
        num += 1;
      }
      data.CP_CntID = data.U_id_c + '-' + data.OSP_id + '-' + num;
      callback(null, data);
    });
  },
  function (data, callback) {
    console.log("4 콘텐츠 추가:",data.CP_title);
    Contents.insertContents(data, function(err, results, fields) {
      if (err) {
        callback('다시 입력해 주세요.');
      }
      callback(null, data);
    });
  },
  function (data, callback) {
    console.log("5 콘텐츠 확인:",data.CP_title);
    Contents.checkInsert(data, function(err, results, fields) {
      if (err) {
        callback('다시 입력해 주세요.');
      }
      callback(null, results[0].n_idx, data);
    });
  },
  function (n_idx, data, callback) {
    console.log("6 키워드 추가:",data.CP_title);
    if (n_idx != "" && data.keyword != "") {
      data.n_idx_c = n_idx;
      data.K_key = '1';
      data.K_type = '1';
      Keyword.insertKeyword(data, function(err, results, fields) {
        if (err) {
          callback('다시 입력해 주세요.');
        }
        callback();
      });
    }
  }
];

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
      var count = 1;
      async.forEach(result,function(item){
        param = {};
        var check = asyncInsert(item, null);
        if(check == false){
          res.redirect('/contents/add/?upload=f');
        }
        else if(count == result.length){
          res.redirect('/contents/add/?upload=t');
        }
        count += 1;
      });

      // res.send('true');
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
  async.waterfall(tasks, function (err) {
    if (err){
      console.log('err:',err);
      return err;
    }
    else{
      console.log('done');
      return true;
    }
  });

}

module.exports = router;
