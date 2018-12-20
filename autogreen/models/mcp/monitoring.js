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
    sql += ' order by n_idx desc ';
    if('type' in body){
      sql += 'limit ?,?'
    }
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
  },
  selectImage: async function(body,param,num){
    var sql = 'select a.f_idx,a.cnt_img_'+num+' as cnt_img_name\
    FROM site.cnt_f_detail as a\
    left join site.cnt_f_list as b on a.f_idx = b.n_idx\
    left join site.osp_o_list as o on b.cnt_osp = o.osp_id\
    where o.osp_tstate = ? and a.cnt_img_'+num+' is not null and a.cnt_img_'+num+' != \'/untitled.jpg\'';
    if('cp' in body){
      sql += ' and b.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and b.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(b.title,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and b.cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and b.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and b.k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and a.cnt_date_1 between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += ' order by a.f_idx desc ';
    return await getResult(sql,param);
  },
  selectImage_: async function(body,param){
    var sql = 'select a.f_idx,i.cnt_img_name,SUBSTRING_INDEX(a.cnt_img_1,\'/\',2) as path FROM site.cnt_f_detail as a\
    left join site.cnt_f_list as b\
    on a.f_idx = b.n_idx\
    LEFT JOIN site.osp_o_list as o \
    ON b.cnt_osp = o.osp_id\
    left join site.go_img as i\
    on a.cnt_url = i.cnt_url AND \
    i.go_chk = 1 AND i.go_regdate IS NOT NULL \
    where o.osp_tstate = ?';
    if('cp' in body){
      sql += ' and b.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and b.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(b.title,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and b.cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and b.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and b.k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and a.cnt_date_1 between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += ' order by a.f_idx desc ';
    return await getResult(sql,param);
  },
  delete: async function(table,param){
    var pValue = Object.values(param);
    var keys = Object.keys(param);
    var arr = [].map.call(keys, function(obj) { return obj+'=?'; });
    var columns = arr.join(' and ');
    var sql = 'delete from '+table+' where '+columns;
    return await getResult(sql,pValue);
  },
  getInfo: async function(param){
    var sql = 'select * from monitoring where n_idx = ?';
    var result = await getResult(sql,param);
    if(result.length > 0){
      return result[0];
    }
    return [];
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
