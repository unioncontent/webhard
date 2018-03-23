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
          cList: result || []
        });
      }
    });
  });
});

router.post('/getCPList', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  User.getCpAllList(function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/update', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  Keyword.updateKeyword(req.body, function(err, result) {
    if (err){
      res.status(500).send('다시시도해주세요.');
      throw err;
    }
    res.send(req.body);
  });
});

router.post('/updateOne', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
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
    res.redirect('/login');
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
    res.redirect('/login');
  }
  res.render('contentsAdd');
});

router.post('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
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
    res.redirect('/login');
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
          'CP_name': item["cpName"],
          'CP_title': item["title"],
          'CP_title_eng': item["engtitle"],
          'OSP_id': item["ospid"],
          'K_method': item["method"],
          'K_apply': item["apply"],
          'delay_time': item["delay_time"],
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
  // console.log("1 CP사 확인\n","select * from user_all_b where U_id=? and U_class=?",[data.CP_name,'c']);
  DBpromise.query("select * from user_all_b where U_name=? and U_class=?",[data.CP_name,'c'])
    .then(rows => {
      // console.log("2 OSP ID확인\n","select * from user_all_b where U_id=? and U_class=?",[data.OSP_id,'o']);
      if(rows == null){
        // console.log('row==null');
        throw new Error('error');
      }
      return DBpromise.query("select U_id, U_pw, U_class, U_name, U_state,\'"+rows[0].U_id+"\' as CP_id from user_all_b where U_id=? and U_class=?",[data.OSP_id,'o'])
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        throw new Error('error');
      }
      // console.log("3 콘텐츠 추가\n","select U_id, U_pw, U_class, U_name, U_state,\'"+rows[0].U_id+"\' as CP_id from user_all_b where U_id=? and U_class=?",[data.OSP_id,'o']);
      var rNum = getRandomInt();
      data.U_id_c = rows[0].CP_id;
      data.CP_CntID = data.U_id_c + '-' + data.OSP_id + '-' + (rNum+1);
      var param = [data.CP_CntID,data.U_id_c,data.CP_title,data.CP_title_eng,data.CP_price,data.CP_hash];
      var sql = 'insert into cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
      return DBpromise.query(sql,param);
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        throw new Error('error');
      }
      console.log("4 콘텐츠 확인");
      sql = 'select * from cnts_list_c where CP_title=? order by CP_regdate desc';
      // console.log(sql,data.CP_title);
      return DBpromise.query(sql,data.CP_title);
    }).catch(handleError)
    .then(rows => {
      if(rows == -1){
        throw new Error('error');
      }
      console.log("5 키워드 추가");
      if(data.CP_CntID == rows[0].CP_CntID){
        data.n_idx_c = rows[0].n_idx;
        data.K_key = '1';
        data.K_type = '1';
        var param = [data.n_idx_c,data.U_id_c,data.keyword,data.K_apply,data.K_method,data.K_key,data.K_type,data.delay_time];
        var sql = 'insert into cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, delay_time, K_regdate) values(?,?,?,?,?,?,?,?,now())';
        return DBpromise.query(sql,param);
      }
    }).catch(handleError)
    .then(rows => {
      console.log('콘텐츠 키워드 insert 끝');
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
