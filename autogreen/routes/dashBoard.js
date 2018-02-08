var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log(req.session.user)
  // if(req.session.user == undefined){
  //   res.redirect('/login')
  // }
  res.render('dashBoard');
});

module.exports = router;
