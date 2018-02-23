var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Contents = {
  getContentsList : function(item,callback) {
    var sql = 'select * from fileis_cnts_list where search is not null';
    // var param = [item.offset,item.limit];
    var param = [];
    if(item.cpId != '0'){
      sql = 'select * from fileis_cnts_list where CP_id=?';
      param.unshift(item.cpId);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'c': sql+=' and CP_cntID =\''+item.search+'\''; break;
        case 't': sql+=' and (search like \'%'+item.search+'%\' or CP_title like \'%'+item.search+'%\')'; break;
      }
    }
    if('offset' in item){
      param.push(item.offset,item.limit);
      sql += ' limit ?,?'
    }
    console.log(sql,param);
    connection.query(sql,param,callback);
    // connection.query(sql+' limit ?,?',param,callback);
  },
  contentsCount : function(item,callback) {
    var sql = 'select count(1) as total from fileis_cnts_list where search is not null';
    var param = [];
    if('cpId' in item){
      if(item.cpId != '0'){
        sql = 'select count(1) as total from fileis_cnts_list where CP_id=?';
        param[0] = item.cpId;
      }
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'c': sql+=' and CP_cntID =\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
      }
    }
    connection.query(sql,param,callback);
  },
  getNextIdx: function(item,callback) {
    var sql = 'select n_idx+1 as idx from fileis_cnts_list_c order by CP_regdate desc limit 1';
    connection.query(sql,callback);
  },
  insertContents: function(item,callback) {
    console.log('----------insertContents--------');
    if('CP_CntID' in item){
      // 콘텐츠 insert
      var param = [item.CP_CntID,item.U_id_c,item.CP_title,item.CP_title_eng,item.CP_price,item.CP_hash];
      sql = 'insert fileis_cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,now())';
      connection.query(sql,param,callback);
    }
  },
  checkInsert: function(item,callback) {
    console.log('----------콘텐츠 확인--------');
    // 콘텐츠 확인
    sql = 'select * from fileis_cnts_list_c where CP_CntID = ?';
    // console.log(sql,item.CP_CntID);
    connection.query(sql,item.CP_CntID,callback);
  },
  deleteContents: function(n_idx,callback){
    var sql = 'delete from fileis_cnts_list_c where n_idx=?';
    connection.query(sql,n_idx,callback);
  },
  getSearchCnt: function(search,callback){
    var sql = 'select * from fileis_cnts_list where search like \'%'+search+'%\'';
    connection.query(sql,callback);
  }
}

module.exports = Contents;
