var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Keyword = {
  updateKeyword: function(item,callback){
    var sql = 'update fileis_cnts_kwd_f set K_method=?, K_key=?, K_apply=? where n_idx=?';
    var param = [item.K_method,item.K_key,item.K_apply,item.n_idx_k];
    connection.query(sql,param,callback);
  },
  updateAllKeyword: function(item,callback){
    var sql = 'update fileis_cnts_kwd_f set K_method=?, K_key=?, K_apply=? where n_idx_c=?';
    var param = Object.values(item);
    connection.query(sql,param,callback);
  },
  deleteKeyword: function(n_idx,callback){
    var sql = 'delete from fileis_cnts_kwd_f where n_idx=?';
    connection.query(sql,n_idx,callback);
  },
  insertKeyword: function(item,callback) {
    var param = [item.n_idx_c,item.U_id_c,item.keyword,item.K_apply,item.K_method,item.K_key,item.K_type];
    var sql = 'insert fileis_cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, K_regdate) values(?,?,?,?,?,?,?,now())';
    console.log(sql,param);
    connection.query(sql,param,callback);
  },
  getKeyInfo: function(idx,callback){
    var sql = 'select * from fileis_cnts_kwd_f where n_idx_c=?';
    connection.query(sql,idx,callback);
  }
}

module.exports = Keyword;
