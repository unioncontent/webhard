var express = require('express');
var mysql      = require('mysql');
var dbconfig   = require('../db/db_con.js');
var connection = mysql.createConnection(dbconfig);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('manual')
  connection.query('SELECT * from fileis_cnts_all_a', function(err, rows, fields) {
    if(err) throw err;
    console.log('fileis_cnts_all_a:', rows);
    // res.send(rows);
  });
});

module.exports = router;
