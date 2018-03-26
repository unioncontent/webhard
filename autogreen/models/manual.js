const mysql = require('mysql');
const promise = require('../db/db_promise.js');
// const info = require('../db/db_con.js');

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
        case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'k': sql+=' and replace(K_keyword,\' \',\'\') like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
      }
    }
    console.log('item:',item);
    if(('sDate' in item) && ('eDate' in item)){
      sql+=' and cs_date between \''+item.sDate+' 00:00:00\' and \''+item.eDate+' 23:59:59\'';
    }
    // console.log(sql+' order by n_idx desc limit ?,?',param);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql+' order by n_idx desc limit ?,?',param,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql+' order by n_idx desc limit ?,?',param)
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
        case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'k': sql+=' and replace(K_keyword,\' \',\'\') like \'%'+item.search+'%\''; break;
      }
    }
    if(('sDate' in item) && ('eDate' in item)){
      sql+=' and cs_date between \''+item.sDate+' 00:00:00\' and \''+item.eDate+' 23:59:59\'';
    }
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql, param, callback);
    console.log(sql,param);
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
  delete: function(OSP_idx,callback){
    var DBpromise = new promise(global.osp);
    DBpromise.query('delete from cnts_all_a where OSP_idx=?;',OSP_idx)
    .then(rows => {
      // console.log('delete from cnts_all_a where OSP_idx=?;',OSP_idx);
      // console.log(rows);
      return DBpromise.query('delete from cnts_sort_e where OSP_idx=?;',OSP_idx);
    })
    .then(rows => {
      // console.log('delete from cnts_sort_e where OSP_idx=?;',OSP_idx);
      // console.log(rows);
      return DBpromise.query('delete from cnts_delay_a where OSP_idx=?;',OSP_idx);
    })
    .then(rows => {
      // console.log('delete from cnts_delay_a where OSP_idx=?;',OSP_idx);
      // console.log(rows);
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      return callback(err,null);
    });
  },
  updateSortData: function(item,callback){
    var sql = 'update cnts_sort_e set CS_state=\'1\',K_apply=?,CS_regdate=now() where OSP_idx=?';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,item,callback);
    console.log(sql,item);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,item)
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
  getCntDatainfo: function(item,callback){
    var sql = 'select * from cnts_all_a where OSP_idx=?';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,item[0],callback);
    console.log(sql,item[0]);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,item[0])
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
  insertHisData: function(item,callback){
    var sql = 'insert into cnts_his_g(U_id_c, OSP_idx, OSP_title, OSP_title_null, OSP_seller, OSP_price, OSP_filename, OSP_regdate)\
    values(?,?,?,?,?,?,?,now())';
    // console.log(sql,item);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,item,callback);
    console.log(sql,item);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,item)
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
  deleteAllTable: function(OSP_idx,callback){
    var sql = 'delete from cnts_all_a where OSP_idx=?';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,OSP_idx,callback);
    console.log(sql,OSP_idx);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,OSP_idx)
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

module.exports = Manual;
