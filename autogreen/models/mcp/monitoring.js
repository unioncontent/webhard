const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var monitoring = {
  selectView: async function(body,param){
    var sql = 'select * from monitoring where osp_tstate = ?';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(title,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and cnt_regdate between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += ' order by n_idx desc limit ?,?';
    return await getResult(sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from monitoring where osp_tstate = ?';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(title,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and cnt_regdate between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    var count = await getResult(sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
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

module.exports = monitoring;
