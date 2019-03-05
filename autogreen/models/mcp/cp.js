const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var cp = {
  selectView: async function(body,param){
    var sql = 'SELECT n_idx, cp_id, if(cp_cname is null,\'\',cp_cname) as cp_cname, cp_class, cp_state, if(cp_mcp is null,\'-1\',cp_mcp) as cp_mcp, cp_mail,\
    DATE_FORMAT(cp_regdate, \'%Y-%m-%d %H:%i:%s\') AS cp_regdate FROM cp_list where n_idx is not null ';
    if('class' in body){
      sql += ' and cp_class = \''+body['class']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'i': sql+=' and cp_id =\''+body.search+'\''; break;
        case 'n': sql+=' and cp_cname like \'%'+body.search+'%\''; break;
      }
    }
    if(param.length > 2){
      sql +=' and ((cp_class = ? and cp_id = ?) or cp_mcp=?)';
    }
    sql += ' and (cp_class != \'a\' and cp_class != \'t\') order by n_idx desc limit ?,?';
    return await getResult(sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from cp_list where n_idx is not null  and (cp_class != \'a\' and cp_class != \'t\')';
    if(param.length > 2){
      sql +=' and ((cp_class = ? and cp_id = ?) or cp_mcp=?)';
    }
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'i': sql+=' and cp_id =\''+body.search+'\''; break;
        case 'n': sql+=' and cp_cname like \'%'+body.search+'%\''; break;
      }
    }
    var count = await getResult(sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  selectCPInfo: async function(param) {
    var sql = 'select n_idx, cp_id, cp_pw, cp_cname, cp_cnum, cp_ceoname, cp_pname, cp_addrs, cp_tel, cp_hp, cp_email, cp_class, cp_mcp, cp_logo, cp_state, DATE_FORMAT(cp_regdate, \'%Y-%m-%d %H:%i:%s\') AS cp_regdate,cp_mail';
    sql += ' from cp_list where n_idx = ?';
    var info = await getResult(sql,param);
    var result;
    if(info.length > 0){
      result = info[0];
    }
    return result;
  },
  selectMCPID: async function(param) {
    var sql = 'select cp_mcp from cp_list where cp_id = ?';
    var info = await getResult(sql,param);
    var result;
    if(info.length > 0){
      result = info[0].cp_mcp;
    }
    return result;
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  delete: async function(param) {
    var sql = 'delete from cp_list where ';
    if(param['type'] == 'idx'){
      sql+= 'n_idx = ?';
    }
    else if(param['type'] == 'mcp'){
      sql+= 'cp_mcp = ?';
    }
    return await getResult(sql,param['val']);
  },
  update: async function(param) {
    var idx = param.idx;
    delete param.idx;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(idx);
    var sql = "update cp_list set "+placeholders+" where n_idx=?;";
    return await getResult(sql,pValue);
  },
  updateWhereId: async function(param) {
    var id = param.id;
    delete param.id;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(id);
    var sql = "update cp_list set "+placeholders+" where cp_id=?;";
    return await getResult(sql,pValue);
  },
  checkCPId:async function(id) {
    var sql = 'select count(*) as total from cp_list where cp_id=?';
    var param = [id];
    var result = await getResult(sql,param);
    if (result[0].total > 0) {
      return 'fail';
    }
    else{
      return 'success';
    }
  }
}

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO cp_list ( "+columns+" ) VALUES ( "+placeholders+" );";

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

module.exports = cp;
