const mysql = require('mysql');
const info = require('../db/db_con.js');

var Filtering = {
  getFilteringList : function(item,callback) {
    var sql = 'select * from filtering where search is not null';
    var param = [];
    if(item.cp_name != '0'){
      sql = 'select * from filtering where cp_name=?';
      param.unshift(item.cp_name);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
    }
    sql += ' order by csDate desc ';
    if('offset' in item){
      param.push(item.offset,item.limit);
      sql += ' limit ?,?'
    }
    // console.log(sql,param);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,param,callback);

  },
  filteringCount : function(item,callback) {
    var sql = 'select count(1) as total from filtering where search is not null';
    var param = [];
    if(item.cp_name != '0'){
      sql = 'select count(1) as total from filtering where cp_name=?';
      param[0] = item.cp_name;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
    }
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql, param, callback);
    
  }
}

module.exports = Filtering;
