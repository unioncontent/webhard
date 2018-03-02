var mysql = require('mysql');
var info = require('../db/db_con.js');
var connection = mysql.createConnection(info.mysql);

var Test = {
  getTable : function(callback) {
    var sql = 'SELECT * FROM test;';
    connection.query(sql,callback);
  }
}

module.exports = Test;
