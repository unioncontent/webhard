const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');
// const info = require('../../db/db_con.js');

var Contents = {
  selectView: async function(body,param){
    var sql = 'select * from cnts_all_view where search is not null';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'c': sql+=' and cnt_id =\''+body.search+'\''; break;
        case 't': sql+=' and search like \'%'+body.search+'%\''; break;
      }
    }
    sql += ' order by n_idx desc limit ?,?';
    return await getResult(sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from cnts_all_view where search is not null ';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'c': sql+=' and cnt_id =\''+body.search+'\''; break;
        case 't': sql+=' and search like \'%'+body.search+'%\''; break;
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
  cntInsertCheck: async function(param) {
    var sql = "select * from cnt_l_list where n_idx = ?";
    var result = await getResult(sql,param);
    return result[0];
  },
  getMCPList: async function(param) {
    var sql = "select * from cp_list where cp_state = 1 and cp_class=?";
    return await getResult(sql,param);
  },
  getMCPList2: async function(param) {
    var sql = "select * from cp_list where cp_class=?";
    return await getResult(sql,param);
  },
  getCPList: async function(param) {
    var value = [];
    var sql = "select * from cp_list where cp_class='c'";
    if('mcp' in param){
      sql += 'and cp_mcp = ?';
      value.push(param.mcp);
    }
    return await getResult(sql,value);
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
    var sql = 'delete from cnt_l_list where n_idx=?';
    return await getResult(sql,n_idx);
  },
  delete2: async function(param){
    var pVal = [];
    var sql = 'delete from cnt_l_list where ';
    if(param['class'] == 'c'){
      sql += 'cnt_mcp=? and cnt_cp=?';
      pVal.push(param['mcp']);
      pVal.push(param['id']);
    } else{
      sql += 'cnt_mcp=?';
      pVal.push(param['id']);
    }
    return await getResult(sql,pVal);
  },
  getCPlistID: async function(param){
    var sql = 'select cp_id from cp_list where (cp_class=\'m\' and cp_id=?) || (cp_class=\'c\' and cp_id=?) order by field(cp_class,\'m\',\'c\')';
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
