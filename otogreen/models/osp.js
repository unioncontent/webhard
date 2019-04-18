const funDB = require('../db/db_fun.js');

var osp = {
  selectView: async function(body,param){
    var sql = 'SELECT n_idx, osp_id, DATE_FORMAT(osp_open, \'%Y-%m-%d\') AS osp_open, \
    if(osp_sname is null,\'\',osp_sname) as osp_sname, osp_tstate, osp_state, if(osp_mobile is null,\'-1\',osp_mobile) as osp_mobile,\
    DATE_FORMAT(osp_regdate, \'%Y-%m-%d %H:%i:%s\') AS osp_regdate FROM osp_o_list where n_idx is not null ';
    if('tstate' in body){
      sql += ' and osp_tstate = \''+body['tstate']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'i': sql+=' and osp_id =\''+body.search+'\''; break;
        case 'n': sql+=' and osp_sname like \'%'+body.search+'%\''; break;
      }
    }
    sql += ' order by osp_regdate desc limit ?,?';
    return await funDB.getResult('b',sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from osp_o_list where n_idx is not null ';
    if('tstate' in body){
      sql += ' and osp_tstate = \''+body['tstate']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'i': sql+=' and osp_id =\''+body.search+'\''; break;
        case 'n': sql+=' and osp_sname like \'%'+body.search+'%\''; break;
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
  selectOSPInfo: async function(param) {
    var sql = 'select o.*,ifnull(format(i.osp_g_rank,0),0) as osp_g_rank, ifnull(format(i.osp_k_rank,0),0) as osp_k_rank, \
    ifnull(format(i.osp_v_total,0),0) as osp_v_total, i.osp_v_str, ifnull(i.osp_v_cNum,0) as osp_v_cNum,\
    DATE_FORMAT(o.osp_open, \'%Y-%m-%d\') AS osp_open_str, DATE_FORMAT(o.osp_regdate, \'%Y-%m-%d %H:%i:%s\') AS osp_regdate_str\
    from osp_o_list as o\
    left join (select * from osp_info where month(osp_i_regdate) = month(curdate()) and year(osp_i_regdate) = year(curdate())) as i on o.osp_id = i.osp_id\
    where o.n_idx =?';
    var info = await funDB.getResult('b',sql,param);
    var result;
    if(info.length > 0){
      result = info[0];
    }
    return result;
  },
  getSixOSPData: async function(param) {
    var sql = 'select o.*, DATE_FORMAT(o.osp_i_regdate, \'%Y-%m\') as osp_regdate from osp_info as o where date(osp_i_regdate) > date_add(now(),interval -6 month) and \
    (month(osp_i_regdate) != month(curdate()) and year(osp_i_regdate) != month(curdate()))\
    and osp_id = ?\
    order by osp_i_regdate asc'
    var info = await funDB.getResult('b',sql,param);
    return info;
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    try {
      await funDB.getResult('a',sql,pValue);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pValue);
    }
  },
  insertMail: async function(type,param){
    var sql = 'insert into osp_m_list(osp_o_idx, cp_mcp, cp_id, m_mail) ';
    if(type == 'osp'){
      sql += 'SELECT ?,cp_mcp,cp_id,\'0\' FROM cp_list where cp_class=\'c\'';
    }
    else{
      sql += 'SELECT n_idx,?,?,\'0\' FROM osp_o_list';
    }
    try {
      await funDB.getResult('a',sql,param);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,param);
    }
  },
  delete: async function(param) {
    var sql = 'delete from osp_o_list where n_idx = ?';
    try {
      await funDB.getResult('a',sql,param);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,param);
    }
  },
  update: async function(param) {
    var idx = param.idx;
    delete param.idx;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(idx);
    var sql = "update osp_o_list set "+placeholders+" where n_idx=?;";
    try {
      await funDB.getResult('a',sql,pValue);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pValue);
    }
  },
  checkOspId:async function(id) {
    var sql = 'select count(*) as total from osp_o_list where osp_id=?';
    var param = [id];
    var result = await funDB.getResult('b',sql,param);
    console.log(result);
    if (result[0].total > 0) {
      return 'fail';
    }
    else{
      return 'success';
    }
  },
  selectOSPList:async function() {
    var sql = 'select n_idx,osp_id,osp_sname from osp_o_list order by osp_sname';
    return await funDB.getResult('b',sql);
  },
  selectOSPList_m:async function(tstate) {
    var sql = 'select n_idx,osp_id,osp_sname from osp_o_list where osp_tstate = ? and osp_state = 1 order by osp_sname';
    if(tstate == 2){
      var sql = 'select n_idx,osp_id,osp_sname from osp_o_list where osp_state = 1 order by osp_sname';
    }
    return await funDB.getResult('b',sql,tstate);
  }
}

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO osp_o_list ( "+columns+" ) VALUES ( "+placeholders+" );";

  return sql;
}


module.exports = osp;
