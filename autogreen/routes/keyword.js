var express = require('express');
var Keyword = require('../models/keyword.js');
var Contents = require('../models/contents.js');
var User = require('../models/user.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('keyword');
});

module.exports = router;
