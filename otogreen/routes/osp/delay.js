var express = require('express');
var Delay = require('../../models/osp/delay.js');
var User = require('../../models/osp/user.js');
var moment = require('moment-timezone');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  var searchObject = {
    offset: 0,
    limit: 50
  }
  Delay.delayCount(searchObject, function(err, result) {
    if (err) throw err;
    var totalDelay = result[0].total;
    var pageCount = Math.ceil(totalDelay / searchObject.limit);
    var currentPage = 1;

    if (typeof req.query.page !== 'undefined') {
      currentPage = req.query.page;
    } else {
      currentPage = 1;
    }

    if (parseInt(currentPage) > 0) {
      searchObject.offset = (currentPage - 1) * searchObject.limit;
    }

    Delay.getDelayList(searchObject, function(err, result) {
      if (err) {
        res.json(err);
      } else {
        res.render('osp/delay', {
          moment: moment,
          data: searchObject,
          dList: result || [],
          totalDelay: totalDelay,
          pageCount: pageCount,
          currentPage: currentPage
        });
      }
    });
  });
});

router.post('/getNextPage', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  var searchObject = {
    offset: Number(req.body.start) || 0,
    limit: 50
  }
  var currentPage = req.body.start;
  Delay.delayCount(searchObject, function(err, result) {
    if (err) throw err;
    total = result[0].total;
    pageCount = Math.ceil(total / searchObject.limit);
    Delay.getDelayList(searchObject, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.send({
          total: total,
          data: searchObject,
          pageCount: pageCount,
          dList: result || []
        });
      }
    });
  });
});

router.post('/insert', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  console.log('Delay.insertDela');
  Delay.insertDelay(req.body, function(err, result) {
    if (err){
      res.status(500).send(err);
      return false;
    }
    res.send('true');
  });
});

module.exports = router;
