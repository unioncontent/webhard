let funDB = require('../../db/db_fun.js');

var calculate = {
  acc_very_view: async function(param,mode=''){
    var sql = 'SELECT a.*';
    if(mode==''){
      sql +=',format(ifnull(count(if(a.ACC_Cnt_Num is not null,1,null)),0),0) as buyCount,format(ifnull(count(if(a.ACC_Admin_Date is not null,1,null)),0),0) as billCount ';
    }
    sql +=' FROM acc_very_view as a where date(a.ACC_Buy_Date) between ? and ? ';
    if(mode==''){
      sql +=' group by a.ACC_Keyword ';
    }
    else{
      sql +=' and a.ACC_Cnt_Title is not null ';
    }
    sql += ' order by a.ACC_Buy_Date desc';
    if(param[param.length-1] == 10){
      sql +=' limit ?,?';
    }
    return await funDB.getResult('b',sql,param);
  },
  acc_very_view_count: async function(param,mode=''){
    var sql = 'SELECT count(*) as total FROM (SELECT * FROM acc_very_view as a where date(a.ACC_Buy_Date) between ? and ? ';
    if(mode==''){
      sql +=' group by a.ACC_Keyword';
    }
    else{
      sql +=' and a.ACC_Cnt_Title is not null ';
    }
    sql+=') as g';
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  acc_very_osp_view: async function(param){
    var sql = 'select format(ifnull(count(a.ACC_No),0),0) as total,o.* from acc_very_osp_view  as o left join acc_very_view as a on o.ACC_User_ID = a.ACC_User_ID group by ACC_Cnt_ID order by ACC_regDate desc limit ?,?';
    return await funDB.getResult('b',sql,param);
  },
  acc_very_osp_view_count: async function(param,mode=''){
    var sql = 'select count(*) as total from (select count(*) as total,o.* from acc_very_osp_view  as o left join acc_very_view as a on o.ACC_User_ID = a.ACC_User_ID group by ACC_Cnt_ID) as r';
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await funDB.getResult('b',sql,pValue);
  },
  insertOSP: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting2(Object.keys(param));
    return await funDB.getResult('b',sql,pValue);
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await funDB.getResult('b',sql,pValue);
  },
  selectCnt: async function(param){
    var sql = "select * from cnt_l_list where cnt_id  like '%"+param+"%' or replace(cnt_title,' ','') like '%"+param+"%'";
    return await funDB.getResult('b',sql);
  },
  delete: async function(n_idx){
    var sql = 'delete from acc_very_osp where ACC_No=?';
    return await funDB.getResult('b',sql,n_idx);
  }
}
function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO acc_very_list ( "+columns+" ) VALUES ( "+placeholders+" );";

  return sql;
}
function insertSqlSetting2(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO acc_very_osp ( "+columns+" ) VALUES ( "+placeholders+" );";

  return sql;
}

module.exports = calculate;
