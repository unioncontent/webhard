const mysql = require('mysql');
const info = require('../db/db_con.js');

var Contents = {
  getContentsList : function(item,callback) {
    var sql = 'select * from cnts_list where search is not null';
    var param = [];
    if(item.cp_name != '0'){
      sql = 'select * from cnts_list where CP_name=?';
      param.unshift(item.cp_name);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'c': sql+=' and CP_cntID =\''+item.search+'\''; break;
        case 't': sql+=' and (search like \'%'+item.search+'%\' or CP_title like \'%'+item.search+'%\')'; break;
      }
    }
    if('offset' in item){
      param.push(item.offset,item.limit);
      sql += ' order by n_idx_c desc limit ?,?'
    }

    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,param,callback);
  },
  contentsCount : function(item,callback) {
    var sql = 'select count(1) as total from cnts_list where search is not null';
    var param = [];
    if('cp_name' in item){
      if(item.cp_name != '0'){
        sql = 'select count(1) as total from cnts_list where CP_name=?';
        param[0] = item.cp_name;
      }
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'c': sql+=' and CP_cntID =\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
    }
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,param,callback);

  },
  getNextIdx: function(item,callback) {
    var sql = 'select n_idx+1 as idx from cnts_list_c order by CP_regdate desc limit 1';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,callback);

  },
  insertContents: function(item,callback) {
    console.log('----------insertContents--------');
    if('CP_CntID' in item){
      // 콘텐츠 insert
      var param = [item.CP_CntID,item.U_id_c,item.CP_title,item.CP_title_eng,item.CP_price,item.CP_hash];
      sql = 'insert into cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
      var connection = mysql.createConnection(info.changeDB(global.osp));
      connection.query(sql,param,callback);

    }
  },
  checkInsert: function(item,callback) {
    console.log('----------콘텐츠 확인--------');
    // 콘텐츠 확인
    sql = 'select * from cnts_list_c where CP_CntID = ?';
    // console.log(sql,item.CP_CntID);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,item.CP_CntID,callback);

  },
  deleteContents: function(n_idx,callback){
    var sql = 'delete from cnts_list_c where n_idx=?';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,n_idx,callback);

  },
  getSearchCnt: function(search,callback){
    var sql = 'select * from cnts_list where search like \'%'+search+'%\'';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,callback);

  }
}

module.exports = Contents;
