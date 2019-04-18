const funDB = require('../../db/db_fun.js');

var mailing = {
  selectView: async function(body,param){
    var sql = 'SELECT * FROM mailling_view where n_idx is not null ';
    if('mcp' in body){
      sql += ' and cp_mcp = \''+body['mcp']+'\'';
    }
    if('cp' in body){
      sql += ' and cp_id = \''+body['cp']+'\'';
    }
    if('state' in body){
      sql += ' and m_mail = \''+body['state']+'\'';
    }
    if('osp' in body){
      sql += ' and osp_o_idx = \''+body['osp']+'\'';
    }
    sql += ' order by osp_sname asc,n_idx desc limit ?,?';
    return await funDB.getResult('b',sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from mailling_view where n_idx is not null ';
    if('mcp' in body){
      sql += ' and cp_mcp = \''+body['mcp']+'\'';
    }
    if('cp' in body){
      sql += ' and cp_id = \''+body['cp']+'\'';
    }
    if('state' in body){
      sql += ' and m_mail = \''+body['state']+'\'';
    }
    if('osp' in body){
      sql += ' and osp_o_idx = \''+body['osp']+'\'';
    }
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  update: async function(param) {
    var idx = param.idx;
    delete param.idx;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(idx);
    var sql = "update osp_m_list set "+placeholders+" where n_idx=?;";
    try {
      await funDB.getResult('a',sql,pValue);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pValue);
    }
  },
  delete: async function(column,param) {
    var sql = "delete from osp_m_list where "+column+" = ?";
    try {
      await funDB.getResult('a',sql,param);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,param);
    }
  }
}
module.exports = mailing;
