var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Filtering = {
  getFilteringList : function(item,callback) {
    var sql = 'select * from fileis_filtering where cp_id=?';
    if(item.cpId == '0'){
      sql = 'select * from fileis_filtering where search is not null';
      delete item.cpId;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
      delete item.searchType;
      delete item.search;
    }
    console.log(item)
    var param = Object.values(item);
    connection.query(sql+' order by csState desc limit ?,?',param,callback);
  },
  filteringCount : function(item,callback) {
    delete item.offset;
    delete item.limit;
    var sql = 'select count(1) as total from fileis_filtering where cp_id=?';
    if(item.cpId == '0'){
      sql = 'select count(1) from fileis_filtering where search is not null';
      delete item.cpId;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
      delete item.searchType;
      delete item.search;
    }
    var param = Object.values(item);
    connection.query(sql, param, callback);
  }
}

module.exports = Filtering;
