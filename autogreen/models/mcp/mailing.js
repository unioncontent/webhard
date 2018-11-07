const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var mailing = {
  selectView: async function(body,param){
    var sql = 'SELECT * FROM mailling_view where n_idx is not null ';
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
    return await getResult(sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from mailling_view where n_idx is not null ';
    if('cp' in body){
      sql += ' and cp_id = \''+body['cp']+'\'';
    }
    if('state' in body){
      sql += ' and m_mail = \''+body['state']+'\'';
    }
    if('osp' in body){
      sql += ' and osp_o_idx = \''+body['osp']+'\'';
    }
    var count = await getResult(sql,param);
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
    return await getResult(sql,pValue);
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

module.exports = mailing;
