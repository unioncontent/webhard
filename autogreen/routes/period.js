var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  res.render('period')
});

module.exports = router;
