var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Keyword = {
  updateKeyword: function(item,callback){
    var sql = 'update fileis_cnts_kwd_f set K_method=?, K_key=? where n_idx=?';
    var param = Object.values(item);
    connection.query(sql,param,callback);
  },
  deleteKeyword: function(n_idx,callback){
    var sql = 'delete from fileis_cnts_kwd_f where n_idx=?';
    connection.query(sql,n_idx,callback);
  },
  insertKeyword: function(item,callback) {
    var param = [item.n_idx_c,item.U_id_c,item.keyword,item.K_apply,item.K_method,'1',item.date];
    var sql = 'insert fileis_cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_regdate) values(?,?,?,?,?,?,?)';
    connection.query(sql,param,callback);
  }
}

module.exports = Keyword;
