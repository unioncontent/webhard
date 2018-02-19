var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Filtering = {
  getFilteringList : function(item,callback) {
    var sql = 'select * from fileis_filtering where search is not null';
    var param = [item.offset,item.limit];
    if(item.cpId != '0'){
      sql = 'select * from fileis_filtering where cp_id=?';
      param.unshift(item.cpId);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
    }
    // console.log(sql+' order by csState desc limit ?,?',param);
    connection.query(sql+' order by csState desc limit ?,?',param,callback);
  },
  filteringCount : function(item,callback) {
    var sql = 'select count(1) as total from fileis_filtering where search is not null';
    var param = [];
    if(item.cpId != '0'){
      sql = 'select count(1) as total from fileis_filtering where cp_id=?';
      param[0] = item.cpId;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
    }
    connection.query(sql, param, callback);
  }
}

module.exports = Filtering;
