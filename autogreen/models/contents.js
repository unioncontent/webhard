var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var Contents = {
  getContentsList : function(item,callback) {
    var sql = 'select * from fileis_cnts_list where search is not null';
    var param = [item.offset,item.limit];
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
    connection.query(sql+' limit ?,?',param,callback);
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
  insertContents: function(item,callback) {
    console.log('----------insertContents--------');
    if('CP_CntID' in item){
      console.log('콘텐츠 insert');
      // 콘텐츠 insert
      var param = [item.CP_CntID,item.U_id_c,item.CP_title,item.CP_title_eng,item.CP_price,item.CP_hash,item.date];
      sql = 'insert fileis_cnts_list_c(CP_CntID, U_id_c, CP_title, CP_title_eng, CP_price, CP_hash, CP_regdate) values(?,?,?,?,?,?,?)';
      connection.query(sql,param,function(err, results, fields) {
        if(err) throw err;
        console.log('콘텐츠 확인');
        // 콘텐츠 확인
        sql = 'select * from fileis_cnts_list_c where CP_CntID = ?';
        console.log(sql,item.CP_CntID);
        connection.query(sql,item.CP_CntID,callback);
      });
    }
    else{
      return false;
    }
  },
  deleteContents: function(n_idx,callback){
    var sql = 'delete from fileis_cnts_list_c where n_idx=?';
    connection.query(sql,n_idx,callback);
  }
}

module.exports = Contents;
