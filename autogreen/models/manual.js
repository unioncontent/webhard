var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Manual = {
  getManualList : function(item,callback) {
    var sql = 'select * from fileis_manual where search is not null';
    var param = [item.offset,item.limit];
    console.log(item.cp_name);
    if(item.cp_name != '0'){
      sql = 'select * from fileis_manual where cp_name=?';
      param.unshift(item.cp_name);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and CP_CntID=\'%'+item.search+'%\''; break;
        case 'c': sql+=' and OSP_idx=\'%'+item.search+'%\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
        case 'k': sql+=' and K_keyword like \'%'+item.search+'%\''; break;
      }
    }
    console.log(sql+' order by n_idx desc limit ?,?',param);
    connection.query(sql+' order by n_idx desc limit ?,?',param,callback);
  },
  manualCount : function(item,callback) {
    var sql = 'select count(1) as total from fileis_manual where search is not null';
    var param = [];
    if(item.cp_name != '0'){
      sql = 'select count(1) as total from fileis_manual where cp_name=?';
      param[0] = item.cp_name;
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and CP_CntID=\'%'+item.search+'%\''; break;
        case 'c': sql+=' and OSP_idx=\'%'+item.search+'%\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
        case 'k': sql+=' and K_keyword like \'%'+item.search+'%\''; break;
      }
    }
    connection.query(sql, param, callback);
  },
  delete: function(OSP_idx,callback){
    var sql = 'delete from ';
    // console.log("all : ",sql+'fileis_cnts_all_a where OSP_idx=?',OSP_idx);
    connection.query(sql+'fileis_cnts_all_a where OSP_idx=?',OSP_idx,callback);
    // console.log("all : ",sql+'fileis_cnts_sort_e where OSP_idx=?',OSP_idx);
    connection.query(sql+'fileis_cnts_sort_e where OSP_idx=?',OSP_idx,callback);
    // console.log("all : ",sql+'fileis_cnts_his_g where OSP_idx=?',OSP_idx);
    connection.query(sql+'fileis_cnts_his_g where OSP_idx=?',OSP_idx,callback);
  },
  updateSortData: function(OSP_idx,callback){
    var sql = 'update fileis_cnts_sort_e set CS_state=\'1\' where OSP_idx=?';
    var cp_name = '';
    connection.query(sql,OSP_idx,function(err,result){
      if(err) throw err;
      sql = 'select U_id_c from fileis_cnts_sort_e where OSP_idx=?';
      cp_name = connection.query(sql,OSP_idx,function(err,result){
        if(err) throw err;
        return result[0].U_id_c;
      });
    });
    return cp_name;
  },
  getCntDatainfo: function(OSP_idx,callback){
    var sql = 'select * from fileis_cnts_all_a where OSP_idx=?';
    connection.query(sql,OSP_idx,callback);
  },
  insertHisData: function(item,callback){
    var sql = 'insert into fileis_cnts_his_g(U_id_c, OSP_idx, OSP_title, OSP_title_null, OSP_seller, OSP_price, OSP_filename, OSP_regdate)\
    values()';
    connection.query(sql,item,callback);
  },
  deleteAllTable: function(OSP_idx,callback){
    var sql = 'delete from fileis_cnts_all_a where OSP_idx=?';
    connection.query(sql,OSP_idx,callback);
  }
}

module.exports = Manual;
