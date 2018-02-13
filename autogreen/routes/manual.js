var express = require('express');
// var Manual = require('../models/manual.js');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }


  res.render('manual',{list: allList})
});

module.exports = router;
