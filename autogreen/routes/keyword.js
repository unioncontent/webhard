var express = require('express');
var mysql      = require('mysql');
var dbconfig   = require('../db/db_con.js');
var connection = mysql.createConnection(dbconfig);
var router = express.Router();

/* GET page. */
router.get('/keyword', function(req, res, next) {
  res.render('keyword')
});

module.exports = router;
