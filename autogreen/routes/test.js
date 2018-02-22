var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  // console.log(req);
  // res.download()
  // res.render('test');
  filepath = 'C:/gitProject/webhard/autogreen/test.xlsx';
  res.setHeader('Content-Type', 'application/x-msdownload');
	res.setHeader("Content-Disposition", "attachment; filename=" + "1234.xls");
	// res.end(filepath, 'binary');
  var fs = require('fs');
  console.log('filepath:',filepath);
  var filestream = fs.createReadStream(filepath);
  filestream.pipe(res);
});
module.exports = router;
