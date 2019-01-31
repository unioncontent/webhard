const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

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
    sql += ' order by n_idx desc limit ?,?';
    return await getResult(sql,param);
  },
  selectViewCount: async function(body,param){
    var sql = 'select count(*) as total from osp_o_list where n_idx is not null ';
    if('cp' in body){
      sql += ' and cnt_cp = \''+body['cp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 'i': sql+=' and osp_id =\''+body.search+'\''; break;
        case 'n': sql+=' and osp_sname like \'%'+body.search+'%\''; break;
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
  selectOSPInfo: async function(param) {
    var sql = 'select n_idx, osp_id, osp_pw, osp_sname, DATE_FORMAT(osp_open, \'%Y-%m-%d\') AS osp_open, osp_cname, osp_cnum, osp_scnum, osp_tstate, osp_ceoname, osp_pname, osp_url, osp_durl, osp_img, osp_addrs, osp_tel, osp_email, osp_mobile, osp_mobile_url, osp_state, DATE_FORMAT(osp_regdate, \'%Y-%m-%d %H:%i:%s\') AS osp_regdate';
    sql += ' from osp_o_list where n_idx = ?';
    var info = await getResult(sql,param);
    var result;
    if(info.length > 0){
      result = info[0];
    }
    return result;
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  insertMail: async function(type,param){
    var sql = 'insert into osp_m_list(osp_o_idx, cp_mcp, cp_id, m_mail) ';
    if(type == 'osp'){
      sql += 'SELECT ?,cp_mcp,cp_id,\'0\' FROM site.cp_list where cp_class=\'c\'';
    }
    else{
      sql += 'SELECT n_idx,?,?,\'0\' FROM site.osp_o_list';
    }
    return await getResult(sql,param);
  },
  delete: async function(param) {
    var sql = 'delete from osp_o_list where n_idx = ?';
    return await getResult(sql,param);
  },
  update: async function(param) {
    var idx = param.idx;
    delete param.idx;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(idx);
    var sql = "update osp_o_list set "+placeholders+" where n_idx=?;";
    return await getResult(sql,pValue);
  },
  checkOspId:async function(id) {
    var sql = 'select count(*) as total from osp_o_list where osp_id=?';
    var param = [id];
    var result = await getResult(sql,param);
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
    return await getResult(sql);
  },
  selectOSPList_m:async function(tstate) {
    var sql = 'select n_idx,osp_id,osp_sname from osp_o_list where osp_tstate = ? and osp_state = 1 order by osp_sname';
    if(tstate == 2){
      var sql = 'select n_idx,osp_id,osp_sname from osp_o_list where osp_state = 1';
    }
    return await getResult(sql,tstate);
  }
}

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO osp_o_list ( "+columns+" ) VALUES ( "+placeholders+" );";

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

module.exports = osp;
