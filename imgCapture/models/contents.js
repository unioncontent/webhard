const logger = require('../winston/config_f.js');
const funDB = require('../db/db_fun.js');
let mysql = require('mysql');

var Contents = {
  cntInsertCheck: async function(param) {
    var sql = "select * from cnt_l_list where n_idx = ?";
    var result = await funDB.getResult(sql,param);
    return result[0];
  },
  insert: async function(param) {
    var mcpid = param["cnt_mcp"];
    var cpid = param["cnt_cp"];
    var pValue = Object.values(param);
    var keys = Object.keys(param);
    var arr = [].map.call(keys, function(obj) { return '?'; });
    columns = keys.join(', ');
    placeholders = arr.join(', ');
    var sql = "INSERT INTO cnt_l_list ( cnt_id,"+columns+" ) VALUES ( (SELECT CONCAT('"+mcpid+"-"+cpid+"-',(IFNULL(max(a.n_idx), 0)+1)) FROM cnt_l_list as a where cnt_mcp='"+mcpid+"' and cnt_cp='"+cpid+"'),"+placeholders+" );";
    return await funDB.getResult(sql,pValue);
  },
  delete: async function(n_idx){
    var sql = 'delete from cnt_l_list where n_idx=?';
    return await funDB.getResult(sql,n_idx);
  },
  getCPlistID: async function(param){
    var sql = 'select cp_id from cp_list where (cp_class=\'m\' and (cp_cname=? or cp_id=?)) || (cp_class=\'c\' and (cp_cname=? or cp_id=?))';
    logger.info(mysql.format(sql, param));
    return await funDB.getResult(sql,param);
  },

  selectBackup: async function(body,param){
    var sql = 'select b.*,DATE_FORMAT(cnt_regdate, \'%Y-%m-%d %H:%i:%s\') as date_time,DATE_FORMAT(cnt_regdate, \'%Y-%m-%d\') as date_str from cnt_backup as b where cnt_regdate > date_add(now(),interval -7 day) ';
    if('searchType' in body){
      switch (body.searchType) {
        case 'w': sql+=' and cnt_title_null like \'%'+body.search+'%\''; break;
      }
    }
    sql += ' order by cnt_regdate desc ';
    if(!('excel' in body)){
      sql +='limit ?,?';
    }
    return await funDB.getResult(sql,param);
  }
}
module.exports = Contents;
