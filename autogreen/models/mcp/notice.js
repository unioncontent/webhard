const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var notice = {
  selectTable: async function(body,param){
    var sql = 'SELECT n_idx, writer, title, content, file, type,\
    DATE_FORMAT(regdate, \'%Y-%m-%d %H:%i:%s\') AS regdate FROM notice where n_idx is not null ';
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and title like \'%'+body.search+'%\''; break;
        case 'c': sql+=' and content like \'%'+body.search+'%\''; break;
        case 'w': sql+=' and writer like \'%'+body.search+'%\''; break;
      }
    }
    if(param.length > 2){
      sql +=' and type=?';
    }
    sql += ' order by n_idx desc limit ?,?';
    return await getResult(sql,param);
  },
  selectTableCount: async function(body,param){
    var sql = 'select count(*) as total from notice where n_idx is not null';
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and title like \'%'+body.search+'%\''; break;
        case 'c': sql+=' and content like \'%'+body.search+'%\''; break;
        case 'w': sql+=' and writer like \'%'+body.search+'%\''; break;
      }
    }
    if(param.length > 2){
      sql +=' and type=?';
    }
    var count = await getResult(sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  delete: async function(param) {
    var sql = 'delete from notice where n_idx = ?';
    return await getResult(sql,param);
  },
  update: async function(param) {
    var idx = param.idx;
    delete param.idx;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(idx);
    var sql = "update notice set "+placeholders+" where n_idx=?;";
    return await getResult(sql,pValue);
  },
  selectNotice: async function(param) {
    var sql = 'select n_idx, writer, title, content, file, type,DATE_FORMAT(regdate, \'%Y-%m-%d %H:%i:%s\') AS regdate';
    sql += ' from notice where n_idx = ?';
    var info = await getResult(sql,param);
    var result;
    if(info.length > 0){
      result = info[0];
    }
    return result;
  }
}

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO notice ( "+columns+" ) VALUES ( "+placeholders+" );";

  return sql;
}

async function getResult(sql,param) {
  var db = new DBpromise('site');
  console.log('sql : ',sql);
  console.log('param : ',param);
  try{
    if(param == undefined){
      return await db.query(sql);
    }
    return await db.query(sql,param);
  } catch(e){
    console.log('DB Error : ',e);
    return [];
  } finally{
    db.close();
  }
}

module.exports = notice;
