var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Contents = {
  getContentsList : function(item,callback) {
    var sql = 'select * from fileis_cnts_list where CP_id=?';
    if(item.cpId == '0'){
      sql = 'select * from fileis_cnts_list where search is not null';
      delete item.cpId;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'c': sql+=' and CP_cntID =\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
      delete item.searchType;
      delete item.search;
    }
    var param = Object.values(item);
    console.log('param: '+param);
    connection.query(sql+' limit ?,?',param,callback);
  },
  contentsCount : function(item,callback) {
    delete item.offset;
    delete item.limit;
    var sql = 'select count(1) from fileis_cnts_list where CP_id=?';
    if(item.cpId == '0'){
      console.log("item.cpId == '0' : ",item.cpId == '0');
      sql = 'select count(1) from fileis_cnts_list where search is not null';
      delete item.cpId;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'c': sql+=' and CP_cntID =\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
      delete item.searchType;
      delete item.search;
    }
    var param = Object.values(item);
    console.log('param: '+param);
    connection.query(sql,param,callback);
  }
}

module.exports = Contents;
