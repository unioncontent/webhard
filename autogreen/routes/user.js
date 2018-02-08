var express = require('express');
var mysql      = require('mysql');
var dbconfig   = require('../db/db_con.js');
var connection = mysql.createConnection(dbconfig);
var router = express.Router();

/* GET page. */
router.get('/user', function(req, res, next) {
  res.render('user')
});
module.exports = router;
//
// /* POST page. */
// router.post('/user', function(req, res, next) {
//   res.render('user')
// });
//
// /* GET page. */
// router.get('/login', function(req, res, next) {
//   console.log(req.session.user)
//   res.render('login');
// });
//
// /* POST page. */
// router.post('/login', function(req, res, next) {
//   console.log(req.session.user)
//   res.render('login');
// });
//
// /* GET page. */
// router.get('/logout', function(req, res, next) {
//   console.log(req.session.user)
//   res.render('login');
// });
