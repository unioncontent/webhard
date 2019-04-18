const funDB = require('../../db/db_fun.js');
// const info = require('../../db/db_con.js');

var Contents = {
  getContentsCounts: async function(body,param){
    var sql = 'select format(count(*),0) as total, format(count(if(k_state = 1,1,null)),0) as ytotal,format(count(if(k_state = 0,1,null)),0) as ntotal,\
    format(count(if(k_method = 1,1,null)),0) as atotal,format(count(if(k_method = 0,1,null)),0) as mtotal,\
    format(count(if(k_mailing = 1,1,null)),0) as mytotal,format(count(if(k_mailing = 0,1,null)),0) as mntotal\
    from cnts_all_view where search is not null ';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'c': sql+=' and cnt_id =\''+body.search+'\''; break;
        case 't': sql+=' and search like \'%'+body.search.replace(/ /gi,'')+'%\''; break;
      }
    }
    var result = await funDB.getResult('b',sql,param);
    if(result.length == 0){
      return 0;
    }
    else{
      return result[0];
    }
  },
  selectAll: async function(body){
    var sql = 'select * from cnt_l_list where n_idx is not null';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and cnt_mcp = \''+body['mcp']+'\'';
    }
    sql += ' order by cnt_title desc';
    return await funDB.getResult('b',sql);
  },
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
        case 't': sql+=' and search like \'%'+body.search.replace(/ /gi,'')+'%\''; break;
      }
    }
    sql += ' order by cnt_regdate_o desc,n_idx desc limit ?,?';
    return await funDB.getResult('b',sql,param);
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
        case 't': sql+=' and search like \'%'+body.search.replace(/ /g,'')+'%\''; break;
      }
    }
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
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
    return await funDB.getResult('b',sql,param);
  },
  selectBackupCount: async function(body,param){
    var sql = 'select count(*) as total from cnt_backup where cnt_regdate > date_add(now(),interval -7 day) ';
    if('searchType' in body){
      switch (body.searchType) {
        case 'w': sql+=' and cnt_title_null like \'%'+body.search+'%\''; break;
      }
    }
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  selectBackupOSPCount: async function(body,param){
    var sql = 'select count(*) as total from (SELECT * FROM cnt_backup where cnt_regdate > date_add(now(),interval -7 day) ';
    if('searchType' in body){
      switch (body.searchType) {
        case 'w': sql+=' and cnt_title like \'%'+body.search+'%\''; break;
      }
    }
    sql += ' group by cnt_osp order by null) a';
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  cntInsertCheck: async function(param) {
    var sql = "select * from cnt_l_list where n_idx = ?";
    var result = await funDB.getResult('b',sql,param);
    return result[0];
  },
  selectInfo: async function(param) {
    var sql = "select * from cnts_all_view where n_idx = ?";
    var result = await funDB.getResult('b',sql,param);
    return result[0];
  },
  getMCPList: async function(param) {
    var sql = "select * from cp_list where cp_state = 1 and cp_class=?";
    return await funDB.getResult('b',sql,param);
  },
  getMCPList2: async function(param) {
    var sql = "select * from cp_list where cp_class=?";
    return await funDB.getResult('b',sql,param);
  },
  getCPList: async function(param) {
    var value = [];
    var sql = "select * from cp_list where cp_class='c'";
    if('mcp' in param){
      sql += 'and cp_mcp = ?';
      value.push(param.mcp);
    }
    else if('cp' in param){
      sql += 'and cp_id = ?';
      value.push(param.cp);
    }
    return await funDB.getResult('b',sql,value);
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
    try {
      await funDB.getResult('a',sql,pValue);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pValue);
    }
  },
  insert_s: async function(param) {
    var pValue = Object.values(param);
    var keys = Object.keys(param);
    var arr = [].map.call(keys, function(obj) { return '?'; });
    columns = keys.join(', ');
    placeholders = arr.join(', ');
    var sql = "INSERT INTO cnt_series ( "+columns+" ) VALUES ( "+placeholders+" );";
    // try {
    //   await funDB.getResult('a',sql,pValue);
    // } catch (e) {
    //   console.log(e)
    // } finally {
    // }
    return await funDB.getResult('b',sql,pValue);
  },
  delete_s: async function(n_idx){
    var sql = 'delete from cnt_series where n_idx=?';
    try {
      await funDB.getResult('a',sql,n_idx);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,n_idx);
    }
  },
  delete: async function(n_idx){
    var sql = 'delete from cnt_l_list where n_idx=?';
    try {
      await funDB.getResult('a',sql,n_idx);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,n_idx);
    }
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
    try {
      await funDB.getResult('a',sql,pVal);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pVal);
    }
  },
  getCPlistID: async function(param){
    var sql = 'select cp_id from cp_list where (cp_class=\'m\' and cp_cname=?) || (cp_class=\'c\' and cp_cname=?)';
    return await funDB.getResult('b',sql,param);
  },
  update: async function(item){
    var sql = 'UPDATE cnt_l_list SET\
    `cnt_id` = ?,\
    `cnt_cp` = ?,\
    `cnt_title` = ?,\
    cnt_series_chk = ?,\
    `cnt_eng_title` = ?,\
    `cnt_director` = ?,\
    `cnt_nat` = ?,\
    `cnt_cate` = ?,\
    `cnt_cpid` = ?,\
    `cnt_period` = ?,\
    `cnt_price` = ?,\
    `cnt_hash` = ?,\
    `cnt_mureka` = ?,\
    `cnt_acom` = ?\
    WHERE `n_idx` = ?';
    var param = Object.values(item);
    try {
      await funDB.getResult('a',sql,param);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,param);
    }
  },
  updateCate: async function(item){
    var sql = 'UPDATE cnt_l_list SET `cnt_cate` = ? WHERE `n_idx` = ?';
    try {
      await funDB.getResult('a',sql,[item['cnt_cate'],item['n_idx']]);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,[item['cnt_cate'],item['n_idx']]);
    }
  },
  selectSeriesList: async function(body,param){
    var sql = 'select * from cnt_series where cnt_L_idx = ?';
    sql += ' order by cnt_s_regdate desc limit ?,?';
    return await funDB.getResult('b',sql,param);
  },
  selectSeriesListCount: async function(body,param){
    var sql = 'select count(*) as total from cnt_series where cnt_L_idx = ? ';
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  }
}

module.exports = Contents;
