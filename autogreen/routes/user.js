var express = require('express');
var mysql      = require('mysql');
var dbconfig   = require('../db/db_con.js');
var connection = mysql.createConnection(dbconfig);
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('user')
});

/* GET page. */
router.get('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('userAdd')
});

module.exports = router
