const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var revenue = {
  selectCnt: async function(param){
    var sql = "select * from cnt_l_list where cnt_id  like '%"+param+"%' or replace(cnt_title,' ','') like '%"+param+"%'";
    return await getResult(sql);
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  insertExcel: async function(values){
    var sql = "INSERT INTO sales (s_mcp, s_cp, s_osp, s_cnt_num, s_title, s_total_money, s_total_sales, s_settlement_money, s_settlement_date) VALUES ?";
    Promise.all(values).then(async function(v) {
      return await getResult(sql,[v]);
    }).catch(function(err){
      console.error("Promise.all error", err);
      return;
    });
  }
}
function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO sales ( "+columns+" ) VALUES ( "+placeholders+" );";

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

module.exports = revenue;
