var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/',isAuthenticated,async function(req, res, next) {
  res.render('mcp/statistics');
});

module.exports = router;
