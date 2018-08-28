const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var Keyword = {
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  insertKwd: async function(item,param) {
    var str = ' k_L_idx, k_L_id, k_mcp, k_cp,\''+param.k_key+'\', k_state, k_apply, k_mailing, k_method';
    if('k_key' in param && 'k_state' in param && 'k_apply' in param  &&'k_mailing' in param  &&'k_method' in param){
      str = ' cnt_idx,cnt_id, cnt_mcp, cnt_cp,\''+param.k_key+'\', \''+param.k_state+'\', \''+param.k_apply+'\', \''+param.k_mailing+'\', \''+param.k_method+'\'';
    }
    var sql = 'insert into k_word(k_title,k_L_idx, k_L_id, k_mcp, k_cp, k_key, k_state, k_apply, k_mailing, k_method)\
    select ?,'+str+' from cnt_kwd_view WHERE NOT EXISTS (SELECT * FROM k_word WHERE k_title=? and k_L_idx = ?) and cnt_idx = ? limit 1;';
    return await getResult(sql,[item,item,param.idx,param.idx]);
  },
  selectCntList: async function(body,param){
    var sql = 'select a.n_idx,a.cnt_mcp, a.cnt_cp, FORMAT(IF(a.CCount is null,0,a.CCount),0) as CCount,FORMAT(IF(k.TCount is null,0,k.TCount),0) as TCount, FORMAT(IF(k.DCount is null,0,k.DCount),0) as DCount from (SELECT n_idx,cnt_mcp,cnt_cp,count(*) as CCount FROM cnt_l_list group by cnt_cp) as a\
    left join (SELECT k_cp,count(IF(k_key=\'1\',1,null)) as TCount,count(IF(k_key=\'0\',1,null)) as DCount FROM k_word group by k_cp) as k\
    on a.cnt_cp = k.k_cp where a.n_idx is not null';
    if('cp' in body){
      sql += ' and a.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and a.cnt_mcp = \''+body['mcp']+'\'';
    }
    sql += ' order by a.cnt_mcp,a.cnt_cp desc limit ?,?';
    return await getResult(sql,param);
  },
  selectCntListCount: async function(body){
    var sql = 'select  count(*) as total from (SELECT n_idx,cnt_mcp,cnt_cp,count(*) as CCount FROM cnt_l_list group by cnt_cp) as a\
    left join (SELECT k_cp,FORMAT(count(IF(k_key=\'1\',1,null)),0) as TCount,FORMAT(count(IF(k_key=\'0\',1,null)),0) as DCount FROM k_word group by k_cp) as k\
    on a.cnt_cp = k.k_cp where a.n_idx is not null';
    if('cp' in body){
      sql += ' and a.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and a.cnt_mcp = \''+body['mcp']+'\'';
    }
    var count = await getResult(sql);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  selectKwdList: async function(body,param){
    var sql = 'select * FROM cnt_kwd_view where cnt_mcp=\''+body.mcp+'\' and cnt_cp=\''+body.cp+'\'';
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and cnt_title like \'%'+body.search+'%\''; break;
        case 'cid': sql+=' and cnt_id like \'%'+body.search+'%\''; break;
      }
    }
    sql += ' order by cnt_regdate desc limit ?,?';
    return await getResult(sql,param);
  },
  selectKwdListCount: async function(body,param){
    var sql = 'select count(*) as total FROM cnt_kwd_view where cnt_mcp=\''+body.mcp+'\' and cnt_cp=\''+body.cp+'\'';
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and cnt_title like \'%'+body.search+'%\''; break;
        case 'cid': sql+=' and cnt_id like \'%'+body.search+'%\''; break;
      }
    }
    var count = await getResult(sql);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  selectKwdDetailList: async function(param){
    var sql = 'select * FROM k_word where k_L_idx=?';
    return await getResult(sql,param);
  },
  delete: async function(param){
    console.log(param);
    var sql = 'delete from k_word where';
    if(param[1] == 'k_idx'){
      sql += ' n_idx=?';
    }
    else if(param[1] == 'cpId'){
      sql += ' k_L_idx=?';
    }
    else if(param[1] == 'all'){
      sql += ' k_mcp=? and k_cp=?';
    }
    return await getResult(sql,param[0]);
  },
  update: async function(item){
    var sql = 'update k_word set k_state=?, k_method=?, k_apply=?, k_mailing=? where k_L_idx=?';
    var param = Object.values(item);
    return await getResult(sql,param);
  },
  updateOneKeyword: async function(item){
    var sql = 'update k_word set ';
    sql += item['type'] + '=? where k_L_idx=?';
    delete  item['type'];
    var param = Object.values(item);
    return await getResult(sql,param);
  },
  updateCpKey: async function(item){
    var sql = 'update k_word set k_key=? where k_L_idx=?';
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
