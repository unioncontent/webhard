var express = require('express');
var mysql      = require('mysql');
var dbconfig   = require('../db/db_con.js');
var connection = mysql.createConnection(dbconfig);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // if(!req.user){
  //   res.redirect('/login');
  // }
  res.render('period')
});

module.exports = router;
