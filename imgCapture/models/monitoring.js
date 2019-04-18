const logger = require('../winston/config_f.js');
const mysql = require('mysql');
const funDB = require('../db/db_fun.js');

var monitoring = {
  call_stats: async function(param){
    var sql = "call stats(?,?, ?, ?, ?, ?, ?, ?, ?, ?)";
    return await funDB.getResult(sql,param);
  },
  imgChkUpdate:async function(){
    logger.info('imgChkUpdate 실행');
    var sql = 'update go_img set go_chk = 0 where cnt_img_name != \'/untitled.jpg\' and go_chk = 1 and cnt_chknum =1 and cnt_url in (select cnt_url from cnt_f_detail where cnt_img_1 is null)';
    await funDB.getResult(sql);
    sql = 'update go_img set go_chk = 0 where cnt_img_name != \'/untitled.jpg\' and go_chk = 1 and cnt_chknum =2 and cnt_url in (select cnt_url from cnt_f_detail where cnt_img_2 is null)';
    await funDB.getResult(sql);
    sql = 'update go_img set go_chk = 0 where cnt_img_name != \'/untitled.jpg\' and go_chk = 1 and cnt_chknum =3 and cnt_url in (select cnt_url from cnt_f_detail where cnt_img_3 is null)';
    await funDB.getResult(sql);
    sql = 'update go_m_img set go_chk = 0 where cnt_img_name != \'/untitled.jpg\' and go_chk = 1 and cnt_chknum =1 and cnt_url in (select cnt_url from cnt_f_m_detail where cnt_img_1 is null)';
    await funDB.getResult(sql);
    sql = 'update go_m_img set go_chk = 0 where cnt_img_name != \'/untitled.jpg\' and go_chk = 1 and cnt_chknum =2 and cnt_url in (select cnt_url from cnt_f_m_detail where cnt_img_2 is null)';
    await funDB.getResult(sql);
    sql = 'update go_m_img set go_chk = 0 where cnt_img_name != \'/untitled.jpg\' and go_chk = 1 and cnt_chknum =3 and cnt_url in (select cnt_url from cnt_f_m_detail where cnt_img_3 is null)';
    return await funDB.getResult(sql);
  },
  monitoringUpdate:async function(pType,chknum,param){
    var sql = 'update cnt_f_'+pType+'detail set cnt_chk_'+chknum+' = ? where cnt_url = ?';
    // var sql = 'update go_site as g, cnt_f_detail as d set g.cnt_chknum = ?,g.cnt_run = ?,g.cnt_date=d.cnt_date_3 where g.cnt_url = ? and g.f_idx = d.n_idx';
    // logger.info(sql,n_idx)
    // logger.info(mysql.format(sql, cnt_url)+';');
    return await funDB.getResult(sql,param);
  },
  monitoringImgUpdate:async function(pType,data){
    var sql = 'update cnt_f_'+pType+'detail set ';
    if(data[3] == '1'){
      sql += "cnt_img_1 = '/untitled.jpg', cnt_img_2 = '/untitled.jpg',";
    }
    else if(data[3] == '2'){
      sql += "cnt_img_2 = '/untitled.jpg',";
    }
    sql += "cnt_img_3 = '/untitled.jpg'";
    sql += ' where cnt_url = ?';
    return await funDB.getResult(sql,data[2]);
  },
  selectExcel: async function(body,param){
    var pType = '';
    if('platform' in body){
      if(body['platform'] == 'mobile'){
        pType = 'm_';
      }
    }
    if('ptype' in body){
      if(body['ptype'] == 'm'){
        pType = 'm_';
      }
    }
    var sql = "select b.* from (select f.n_idx,f.cnt_L_idx, f.cnt_L_id, f.cnt_num, f.cnt_osp, f.cnt_title as title, f.cnt_url, f.cnt_price, f.cnt_writer, f.cnt_vol, f.cnt_cate, f.cnt_fname, f.cnt_mcp, f.cnt_cp, f.cnt_keyword, f.cnt_f_regdate,o.osp_sname,o.osp_tstate,k.k_title,c.cnt_title as cnt_title,SUBSTRING_INDEX(d.cnt_img_1, '/', 2) AS path,d.cnt_img_1,d.cnt_img_2,d.cnt_img_3,DATE_FORMAT(d.cnt_date_1, '%Y-%m-%d %H:%i:%s') AS cnt_date_1, DATE_FORMAT(d.cnt_date_2, '%Y-%m-%d %H:%i:%s') AS cnt_date_2,DATE_FORMAT(d.cnt_date_3, '%Y-%m-%d %H:%i:%s') AS cnt_date_3,d.cnt_chk_1,d.cnt_chk_2,d.cnt_chk_3 from cnt_f_"+pType+"list as f left join cnt_f_"+pType+"detail as d ON f.n_idx = d.f_idx join osp_o_list as o on f.cnt_osp = o.osp_id left join k_word as k on f.cnt_keyword = k.n_idx left join cnt_l_list as c on f.cnt_L_idx = c.n_idx where  f.n_idx is not null ";

    if(param[0] != '3'&&param[0] != '4'){
      sql += ' and o.osp_tstate = ?';
    } else if(param[0] != '4'){
      sql +=' and d.cnt_chk_1 = 0 and f.cnt_L_id =\''+body.cnt_L_id+'\'';
    }
    if('chk' in body){
      sql += ' and d.cnt_chk_1 = \''+body['chk']+'\'';
    }
    if('mcp' in body){
      sql += ' and f.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('cp' in body){
      sql += ' and f.cnt_cp = \''+body['cp']+'\'';
    }
    if('osp' in body){
      sql += ' and f.cnt_osp = \''+body['osp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(f.cnt_title_null,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and f.cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and f.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and k.k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and d.cnt_date_1 between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += "order by f.n_idx desc)  b join cnt_f_"+pType+"list a on b.n_idx = a.n_idx";
    logger.info('selectExcel : ',mysql.format(sql, param)+';');
    if(param[0] != '3'){
      return await funDB.getResult(sql,param);
    } else{
      return await funDB.getResult(sql);
    }
  },
  selectImage: async function(body,param,num){
    var pType = '';
    if('platform' in body){
      if(body['platform'] == 'mobile'){
        pType = 'm_';
      }
    }
    if('ptype' in body){
      if(body['ptype'] == 'm'){
        pType = 'm_';
      }
    }
    var sql = 'select a.f_idx,a.cnt_img_'+num+' as cnt_img_name FROM cnt_f_'+pType+'detail as a left join cnt_f_'+pType+'list as b on a.f_idx = b.n_idx left join osp_o_list as o on b.cnt_osp = o.osp_id where a.cnt_img_'+num+' is not null and a.cnt_img_'+num+' != \'/untitled.jpg\'';
    if(param[0] != '3'&&param[0] != '4'){
      sql += ' and o.osp_tstate = ?';
    } else if(param[0] != '4'){
      sql+=' and b.cnt_L_id =\''+body.cnt_L_id+'\'';
    }

    if('chk' in body){
      sql += ' and a.cnt_chk_1 = \''+body['chk']+'\'';
    }
    if('cp' in body){
      sql += ' and b.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and b.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('osp' in body){
      sql += ' and b.cnt_osp = \''+body['osp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(b.cnt_title_null,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and b.cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and b.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and b.k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and a.cnt_date_1 between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += ' order by a.f_idx desc ';
    logger.info('selectImage : ',mysql.format(sql, param)+';');
    if(param[0] != '3'){
      return await funDB.getResult(sql,param);
    } else{
      return await funDB.getResult(sql);
    }
  }
};

module.exports = monitoring;
