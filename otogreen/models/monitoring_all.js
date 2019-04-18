const funDB = require('../db/db_fun.js');

var monitoring = {
  selectTable: async function(body,param){
    console.log(body,param);
    var table_type = (('ptype' in body)? '_m':'');
    var sql = 'select o.osp_sname,c.n_idx as cidx,c.cnt_title as ctitle,a.* from(select l.*,\
    DATE_FORMAT(d.cnt_date_1, \'%Y-%m-%d %H:%i:%s\') AS `cnt_date_1`,\
    DATE_FORMAT(d.cnt_date_2, \'%Y-%m-%d %H:%i:%s\') AS `cnt_date_2`,\
    DATE_FORMAT(d.cnt_date_3, \'%Y-%m-%d %H:%i:%s\') AS `cnt_date_3`,\
    DATE_FORMAT(l.cnt_f_regdate, \'%Y-%m-%d %H:%i:%s\') AS cnt_date,\
    d.cnt_chk_1,d.cnt_chk_2,d.cnt_chk_3,\
    d.cnt_img_1,d.cnt_img_2,d.cnt_img_3,\
    d.cnt_mail_1,d.cnt_mail_2,d.cnt_mail_3\
    from cnt_f'+table_type+'_list as l\
    left join cnt_f'+table_type+'_detail as d on l.n_idx = d.f_idx\
    where d.cnt_date_1 between \''+body['sDate']+' 00:00:00\' and \''+body['eDate']+' 23:59:59\'';
    if('cnt_chk_1' in body){
      sql += ' and d.cnt_chk_1 = \''+body['cnt_chk_1']+'\'';
    }
    if('osp' in body){
      sql += ' and l.cnt_osp = \''+body['osp']+'\'';
    }
    if('cp' in body){
      sql += ' and l.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and l.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('cnt_L_id' in body){
      sql +=' and l.cnt_L_id =\''+body.cnt_L_id+'\'';
    }
    if('cnt_f_mchk' in body){
      if(body.cnt_f_mchk == '0'){
        sql +=' and (l.cnt_f_mchk =\''+body.cnt_f_mchk+'\' or l.cnt_f_mchk is null) ';
      }
      else{
        sql +=' and l.cnt_f_mchk =\''+body.cnt_f_mchk+'\'';
      }
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and l.cnt_title_null like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'n': sql+=' and l.cnt_num =\''+body.search+'\''; break;
      }
    }
    if('tstate' in body){
      sql +=' and l.cnt_osp in (select osp_id from osp_o_list where osp_tstate =\''+body.tstate+'\') ';
    }
    sql += 'order by d.cnt_date_1 desc limit ?,?) a \
    left join cnt_l_list as c on a.cnt_L_idx = c.n_idx\
    left join osp_o_list as o on a.cnt_osp = o.osp_id\
     order by a.cnt_date_1 desc';
    return await funDB.getResult('b',sql,param);
  },
  selectTableCount: async function(body,param){
    var table_type = (('ptype' in body)? '_m':'');
    var sql = 'select count(*) as total from cnt_f'+table_type+'_list as l left join cnt_f'+table_type+'_detail as d on l.n_idx = d.f_idx\
    where d.cnt_date_1 between \''+body['sDate']+' 00:00:00\' and \''+body['eDate']+' 23:59:59\' ';
    if('cnt_chk_1' in body){
      sql += ' and d.cnt_chk_1 = \''+body['cnt_chk_1']+'\'';
    }
    if('osp' in body){
      sql += ' and l.cnt_osp = \''+body['osp']+'\'';
    }
    if('cp' in body){
      sql += ' and l.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and l.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('cnt_L_id' in body){
      sql +=' and l.cnt_L_id =\''+body.cnt_L_id+'\'';
    }
    if('cnt_f_mchk' in body){
      if(body.cnt_f_mchk == '0'){
        sql +=' and (l.cnt_f_mchk =\''+body.cnt_f_mchk+'\' or l.cnt_f_mchk is null) ';
      }
      else{
        sql +=' and l.cnt_f_mchk =\''+body.cnt_f_mchk+'\'';
      }
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and l.cnt_title_null like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'n': sql+=' and l.cnt_num =\''+body.search+'\''; break;
      }
    }
    if('tstate' in body){
      sql +=' and l.cnt_osp in (select osp_id from osp_o_list where osp_tstate =\''+body.tstate+'\') ';
    }
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
}

module.exports = monitoring;
