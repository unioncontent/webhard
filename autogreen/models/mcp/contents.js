const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');
// const info = require('../../db/db_con.js');

var Contents = {
  cntInsertCheck: async function(param) {
    var sql = "select * from cnt_l_list where n_idx = ?";
    var result = await getResult(sql,param);
    return result[0];
  },
  getMCPList: async function(param) {
    var sql = "select * from cp_list where cp_state = 1 and cp_class=?";
    return await getResult(sql,param);
  },
  insert: async function(param) {
    var mcpid = param["cnt_mcp"];
    var cpid = param["cnt_cp"];
    var pValue = Object.values(param);
    var keys = Object.keys(param);
    var arr = [].map.call(keys, function(obj) { return '?'; });
    columns = keys.join(', ');
    placeholders = arr.join(', ');
    var sql = "INSERT INTO cnt_l_list ( cnt_id,"+columns+" ) VALUES ( (SELECT CONCAT('"+mcpid+"-"+cpid+"-',(IFNULL(max(a.n_idx), 0)+1)) FROM site.cnt_l_list as a where cnt_mcp='"+mcpid+"' and cnt_cp='"+cpid+"'),"+placeholders+" );";
    return await getResult(sql,pValue);
  },
  delete: async function(n_idx){
    var sql = 'delete from cnts_list_c where n_idx=?';
    return await getResult(sql,n_idx);
  },
  getCPlistID: async function(param){
    var sql = 'select cp_id from cp_list where (cp_class=\'m\' and cp_cname=?) || (cp_class=\'c\' and cp_cname=?)';
    return await getResult(sql,param);
  }
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

module.exports = Contents;
