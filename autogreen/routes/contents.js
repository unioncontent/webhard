var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('contents')
});

router.get('/add', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('contentsAdd')
});

router.get('/keyword', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }
  res.render('keyword')
});

module.exports = router;
