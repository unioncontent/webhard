const mysql = require('mysql');
const funDB = require('../db/db_fun.js');

var Keyword = {
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await funDB.getResult(sql,pValue);
  }
}

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO k_word ( "+columns+" ) VALUES ( "+placeholders+" );";

  return sql;
}
module.exports = Keyword;
