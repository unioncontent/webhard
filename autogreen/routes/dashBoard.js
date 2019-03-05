var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
// DB module
var contents = require('../models/mcp/contents.js');
var User = require('../models/osp/user.js');
var DashBoard = require('../models/dashBoard.js');
var Cp = require('../models/mcp/cp.js');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

/* GET home page. */
router.get('/',isAuthenticated,async function(req, res, next) {
  if(res.locals.userSite != "autogreen"){
    var countObj = await DashBoard.getStatistics(global.osp);
    var CPList = await DashBoard.getCPList(global.osp);
    var arr = await DashBoard.getStatistics(global.osp,CPList);
    if(countObj === false){
      res.render('osp/dashBoard',{
        count : [0,0,0,0],
        countList : []
      });
      return false;
    }
    Promise.all(arr).then(function(entry) {
      res.render('osp/dashBoard',{
        count : countObj,
        countList : entry
      });
    }).catch(function(err) {
      // dispatch a failure and throw error
      throw err;
      res.render('osp/dashBoard',{
        count : countObj,
        countList : []
      });
    });
    return false;
  }
  else{
    var mid = '';
    var cid = '';
    if(req.user.U_class == 'm'){
      mid = req.user.U_id;
    }
    else if(req.user.U_class == 'c'){
      mid = await Cp.selectMCPID(req.user.U_id);
      cid = req.user.U_id;
    }
    var data = await getResultStats(req.user.U_class,mid,cid);
    if(req.user.U_class == 'm'){
      data.cpList = await contents.getCPList({mcp:mid});
    }
    else if(req.user.U_class == 'a'){
      data.mcpList = await contents.getMCPList('m');
      data.cpList = [];
    }
    res.render('mcp/dashBoard',data);
  }
});

router.post('/dashBoard/setting',isAuthenticated,async function(req, res, next){
  console.log(req.body);
  if(req.user.U_class == 'm'){
    req.body.mid = req.user.U_id;
  }
  var data = await getResultStats(req.user.U_class,req.body.mid,req.body.cid);
  if(req.user.U_class == 'a' && req.body.type == 'selectMCP'){
    data.cpList = await contents.getCPList({mcp:req.body.mid});
  }
  res.send(data);
});

// async function getResultStats(uclass,mcpid,cpid){
//   var data = {
//     ospCount:0,
//     ospACount:0,
//     ospNACount:0,
//     contentsCount:0,
//     aCount:0,
//     naCount:0,
//     ospTotalCount:[],
//     ospTotalCountList:[],
//     notice:[]
//   };
//   var result1 = await DashBoard.call_dashBoard(1,[uclass,mcpid,cpid]);
//   data.ospCount = (result1.length > 2) ? result1[0][0].total:'0';
//   data.ospACount = (result1.length > 2) ? result1[1][0].atotal:'0';
//   data.ospNACount = (result1.length > 2) ? result1[1][0].natotal:'0';
//   data.contentsCount = (result1.length > 2) ? result1[2][0].total:'0';
//   data.notice = (result1.length > 2) ? result1[3]:[];
//   // var result2 = await DashBoard.call_dashBoard(2,[uclass,mcpid,cpid]);
//   // data.aCount = (result2.length > 0) ? result2[0][0].atotal:'0';
//   // data.naCount = (result2.length > 0) ? result2[0][0].natotal:'0';
//   var result3 = await DashBoard.call_dashBoard(3,[uclass,mcpid,cpid]);
//   data.ospTotalCount = (result3.length > 1) ? result3[0][0]:{total:'0',atotal:'0',natotal:'0'};
//   data.aCount = data.ospTotalCount.atotal;
//   data.naCount = data.ospTotalCount.natotal;
//   data.ospTotalCountList = (result3.length > 1) ? result3[1]:[];
//
//   return data;
// }

async function getResultStats(uclass,mcpid,cpid){
  var data = {
    ospCount:0,
    ospACount:0,
    ospNACount:0,
    dayResultlist:[],
    dayResultlist_m:[],
    totalCount:{total:'0',atotal:'0',natotal:'0'},
    naTotalCount:{atotal:'0',dtotal:'0',natotal:'0'},
    osplist:[]
  };
  var result1 = await DashBoard.call_dashBoard(1,[uclass,mcpid,cpid]);
  data.ospCount = (result1.length > 1) ? result1[0][0].total:'0';
  data.ospACount = (result1.length > 2) ? result1[1][0].atotal:'0';
  data.ospNACount = (result1.length > 2) ? result1[1][0].natotal:'0';
  data.osplist = (result1.length > 3) ? result1[2]:[];
  data.dayResultlist = (result1.length > 4) ? result1[3]:[];
  data.dayResultlist_m = (result1.length > 5) ? result1[4]:[];
  // var result2 = await DashBoard.call_dashBoard(2,[uclass,mcpid,cpid]);
  // data.aCount = (result2.length > 0) ? result2[0][0].atotal:'0';
  // data.naCount = (result2.length > 0) ? result2[0][0].natotal:'0';
  var result3 = await DashBoard.call_dashBoard(3,[uclass,mcpid,cpid]);
  data.naTotalCount = (result3.length > 4) ? {atotal:Number(result3[0][0].atotal)+Number(result3[2][0].atotal),dtotal:Number(result3[0][0].dtotal)+Number(result3[2][0].dtotal),natotal:Number(result3[0][0].natotal)+Number(result3[2][0].natotal)}:{atotal:'0',dtotal:'0',natotal:'0'};
  data.totalCount = (result3.length > 4) ? {total:Number(result3[1][0].total)+Number(result3[3][0].total),atotal:Number(result3[1][0].atotal)+Number(result3[3][0].atotal),natotal:Number(result3[1][0].natotal)+Number(result3[3][0].natotal)}:{total:'0',atotal:'0',natotal:'0'};
  // data.ospTotalCountList = (result3.length > 1) ? result3[1]:[];

  return data;
}

router.post('/get24DataList', async function(req, res, next) {
  console.log('get24DataList');
  var result = await DashBoard.get24DataList(global.osp);
  res.send(result);
});

router.get('/login', function(req, res, next) {
  res.render('login', {layout: false, message : req.flash('loginMessage')});
});

router.post('/login', function (req, res, next) {
  //  패스포트 모듈로 인증 시도
  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if('U_id' in user){
        return res.redirect('/');
      }
    });
  })(req, res, next);

});

router.get('/logout', function (req, res){
  delete global.name;
  req.logout();
  res.redirect('/');
});

/* set passport*/
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
},
async function(req, username, password, done) {
  try{
    var result = await DashBoard.checkId(username);
    if (result.length == 0) {
      return done(null, false, req.flash('loginMessage', '아이디가 존재하지 않습니다.'));
    }
    if (result[0].U_pw !== password) {
      return done(null, false, req.flash('loginMessage', '비밀번호가 맞지 않습니다.'));
    }
    return done(null, result[0]);
  }
  catch(err){
    return done(err);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = router;
