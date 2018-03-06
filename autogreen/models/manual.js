const mysql = require('mysql');
const info = require('../db/db_con.js');

var Manual = {
  getManualList : function(item,callback) {
    var sql = 'select * from manual where search is not null';
    var param = [item.offset,item.limit];
    if(item.cp_name != '0'){
      sql = 'select * from manual where cp_name=?';
      param.unshift(item.cp_name);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and CP_CntID=\''+item.search+'\''; break;
        case 'c': sql+=' and OSP_idx=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
        case 'k': sql+=' and K_keyword like \'%'+item.search+'%\''; break;
      }
    }
    // console.log(sql+' order by n_idx desc limit ?,?',param);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql+' order by n_idx desc limit ?,?',param,callback);
    console.log("sjfklsjdklfskldfsdl");
    
  },
  manualCount : function(item,callback) {
    var sql = 'select count(1) as total from manual where search is not null';
    var param = [];
    if(item.cp_name != '0'){
      sql = 'select count(1) as total from manual where cp_name=?';
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
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql, param, callback);

  },
  delete: function(OSP_idx,callback){
    var sql = 'delete from ';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql+'cnts_all_a where OSP_idx=?',OSP_idx,callback);
    connection.query(sql+'cnts_sort_e where OSP_idx=?',OSP_idx,callback);
    connection.query(sql+'cnts_his_g where OSP_idx=?',OSP_idx,callback);

  },
  updateSortData: function(item,callback){
    var sql = 'update cnts_sort_e set CS_state=\'1\',K_apply=?,CS_regdate=now() where OSP_idx=?';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,item,callback);

  },
  getCntDatainfo: function(item,callback){
    var sql = 'select * from cnts_all_a where OSP_idx=?';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,item[0],callback);

  },
  insertHisData: function(item,callback){
    var sql = 'insert into cnts_his_g(U_id_c, OSP_idx, OSP_title, OSP_title_null, OSP_seller, OSP_price, OSP_filename, OSP_regdate)\
    values(?,?,?,?,?,?,?,now())';
    // console.log(sql,item);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,item,callback);

  },
  deleteAllTable: function(OSP_idx,callback){
    var sql = 'delete from cnts_all_a where OSP_idx=?';
    // console.log(sql,OSP_idx);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,OSP_idx,callback);

  }
}

module.exports = Manual;
