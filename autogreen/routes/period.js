var express = require('express');
var mysql      = require('mysql');
var dbconfig   = require('../db/db_con.js');
var connection = mysql.createConnection(dbconfig);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var allList = [];
  // connection.query('SELECT * from fileis_cnts_all_a', function(err, rows, fields) {
  //   if(err) throw err;
  //   allList = rows;
  // });

  res.render('period')
});

module.exports = router;
