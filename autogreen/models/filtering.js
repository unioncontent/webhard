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
    if('type' in item){
      sql+=' and k_method=\''+((item.type == 'a') ? '1' : '0')+'\'';
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'k': sql+=' and replace(K_keyword,\' \',\'\') like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
      }
    }
    if(('sDate' in item) && ('eDate' in item)){
      sql+=' and csDate between \''+item.sDate+' 00:00:00\' and \''+item.eDate+' 23:59:59\'';
    }

    sql += ' order by csDate desc ';
    if('offset' in item){
      param.push(item.offset,item.limit);
      sql += ' limit ?,?'
    }

    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,param,callback);
    var DBpromise = new promise(global.osp);
    console.log(sql,param);
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
    if('type' in item){
      sql+=' and k_method=\''+((item.type == 'a') ? '1' : '0')+'\'';
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and osp_idx=\''+item.search+'\''; break;
        case 'c': sql+=' and cnt_id=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+item.search+'%\''; break;
        case 'k': sql+=' and replace(K_keyword,\' \',\'\') like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
      }
    }
    if(('sDate' in item) && ('eDate' in item)){
      sql+=' and csDate between \''+item.sDate+' 00:00:00\' and \''+item.eDate+' 23:59:59\'';
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
  getCntsAllList: function(item,callback) {
    var sql = 'select * from cnts_all where search is not null';
    var param = [item.offset,item.limit];
    if(item.cp_name != '0'){
      sql = 'select * from cnts_all where cp_name=?';
      param.unshift(item.cp_name);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'k': sql+=' and replace(K_keyword,\' \',\'\') like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'n': sql+=' and OSP_idx=\''+item.search+'\''; break;
      }
    }
    if(('sDate' in item) && ('eDate' in item)){
      sql+=' and OSP_regdate between \''+item.sDate+' 00:00:00\' and \''+item.eDate+' 23:59:59\'';
    }
    sql += ' order by n_idx desc limit ?,?';

    var DBpromise = new promise(global.osp);
    console.log(sql,param);
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
  CntsAllListCount : function(item,callback) {
    var sql = 'select count(1) as total from cnts_all where search is not null';
    var param = [];
    if(item.cp_name != '0'){
      sql = 'select count(1) as total from cnts_all where cp_name=?';
      param.unshift(item.cp_name);
    }
    if('searchType' in item){
      switch (item.searchType) {
        case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'k': sql+=' and replace(K_keyword,\' \',\'\') like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
        case 'n': sql+=' and OSP_idx=\''+item.search+'\''; break;
      }
    }
    if(('sDate' in item) && ('eDate' in item)){
      sql+=' and OSP_regdate between \''+item.sDate+' 00:00:00\' and \''+item.eDate+' 23:59:59\'';
    }
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
  cancelDelete: function(OSP_idx,callback){
    var DBpromise = new promise(global.osp);
    DBpromise.query('delete from cnts_sort_e where OSP_idx=?;',OSP_idx)
    .then(rows => {
      return DBpromise.query('delete from cnts_his_g where OSP_idx=?;',OSP_idx);
    })
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      return callback(err,null);
    });
  }
}

module.exports = Filtering;
