const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var stats = {
  call_stats: async function(param){
    var sql = "call site.stats(?,?,?, ?, ?, ?, ?, ?, ?)";
    // call site.stats('0','','kbs', '', 'a.cnt_osp', '2018-11-01', '2018-11-01');
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

module.exports = stats;
