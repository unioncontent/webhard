var express = require('express');
var Delay = require('../models/delay.js');
var User = require('../models/user.js');
var router = express.Router();

// 페이징
var totalUser = 0;
var pageCount = 0;
var currentPage = 1;

router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
});

router.post('/insert', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  console.log('Delay.insertDela');
  Delay.insertDelay(req.body, function(err, result) {
    if (err){
      res.status(500).send(err);
      return false;
    }
    res.send('true');
  });
});

module.exports = router;
