const mysql = require('mysql');
const promise = require('../db/db_promise.js');
// const info = require('../db/db_con.js');

var Filtering = {
  getFilteringList : function(item,callback) {
    var sql = 'select * from filtering where search is not null';
    var param = [];
    if(item.cp_name != '0' && item.cp_name != 'null'){
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
    
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,param,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,param)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  filteringCount : function(item,callback) {
    var sql = 'select count(1) as total from filtering where search is not null';
    var param = [];
    if(item.cp_name != '0' && item.cp_name != 'null'){
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
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql, param, callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,param)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  }
}

module.exports = Filtering;
