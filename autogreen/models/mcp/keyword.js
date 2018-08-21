const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var Keyword = {
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  delete: async function(param){
    var sql = 'delete from k_word where';
    if(param[1] == 'k_idx'){
      sql += ' n_idx=?';
    }
    else if(param[1] == 'cpId'){
      sql += ' k_L_idx=?';
    }
    return await getResult(sql,param[0]);
  },
  update: async function(item){
    var sql = 'update k_word set k_state=?, K_apply=?, k_mailing=? where k_L_idx=?';
    var param = Object.values(item);
    return await getResult(sql,param);
  },
  updateCpKey: async function(item){
    var sql = 'update k_word set K_key=? where k_L_idx=?';
    delete  item['type'];
    var param = Object.values(item);
    return await getResult(sql,param);
  }
}

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO k_word ( "+columns+" ) VALUES ( "+placeholders+" );";

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

module.exports = Keyword;
