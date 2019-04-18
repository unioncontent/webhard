const funDB = require('../db/db_fun.js');

var monitoring = {
  callMonitoring: async function(param){
    var sql = "call monitoring(?,?,?,?,?,?,?,?,?,?,?)";
    // call monitoring('1',' and f.cnt_mcp = \'kbs\'','','2018-12-17 00:00:00', '2018-12-19 23:59:59', '0', '20')
    return await funDB.getResult('b',sql,param);
  },
  selectJoinTable: async function(body,param){
    console.log(body,param);
    var table_type = (('ptype' in body)? '_m':'');
    var sql = 'select o.osp_sname,c.n_idx as cidx,c.cnt_title as ctitle,a.* from(select l.*,\
    DATE_FORMAT(d.cnt_date_1, \'%Y-%m-%d %H:%i:%s\') AS `cnt_date_1`,\
    DATE_FORMAT(d.cnt_date_2, \'%Y-%m-%d %H:%i:%s\') AS `cnt_date_2`,\
    DATE_FORMAT(d.cnt_date_3, \'%Y-%m-%d %H:%i:%s\') AS `cnt_date_3`,\
    DATE_FORMAT(l.cnt_f_regdate, \'%Y-%m-%d %H:%i:%s\') AS cnt_date,\
    d.cnt_chk_1,d.cnt_chk_2,d.cnt_chk_3,d.cnt_img_1,d.cnt_img_2,d.cnt_img_3\
    from cnt_f'+table_type+'_list as l\
    left join cnt_f'+table_type+'_detail as d on l.n_idx = d.f_idx\
    where (l.cnt_f_mchk is null or l.cnt_f_mchk = 0) and d.cnt_date_1 between \''+body['sDate']+' 00:00:00\' and \''+body['eDate']+' 23:59:59\'';
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
     order by a.cnt_date_1 desc;';
    return await funDB.getResult('b',sql,param);
  },
  selectJoinTableCount: async function(body,param){
    var table_type = (('ptype' in body)? '_m':'');
    var sql = 'select count(*) as total from cnt_f'+table_type+'_list as l left join cnt_f'+table_type+'_detail as d on l.n_idx = d.f_idx\
    where (l.cnt_f_mchk is null or l.cnt_f_mchk = 0) and d.cnt_date_1 between \''+body['sDate']+' 00:00:00\' and \''+body['eDate']+' 23:59:59\' ';
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
  delete: async function(table,param){
    var pValue = Object.values(param);
    var keys = Object.keys(param);
    var arr = [].map.call(keys, function(obj) { return obj+'=?'; });
    var columns = arr.join(' and ');
    var sql = 'delete from '+table+' where '+columns;
    try {
      await funDB.getResult('a',sql,pValue);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pValue);
    }
  },
  getInfo: async function(param){
    var sql = 'select * from monitoring where n_idx = ?';
    var result = await funDB.getResult('b',sql,param);
    if(result.length > 0){
      return result[0];
    }
    return [];
  },
  getInfo_m: async function(param){
    var sql = 'select * from monitoring_m where n_idx = ?';
    var result = await funDB.getResult('b',sql,param);
    if(result.length > 0){
      return result[0];
    }
    return [];
  },
  updateMChk: async function(type,param){
    var sql = 'update cnt_f_'+type+'list set cnt_f_mchk= 1 where n_idx = ?';
    if(param.length > 1){
      sql = sql.replace('cnt_f_mchk= 1','cnt_f_mchk= ?');
    }
    return await funDB.getResult('b',sql,param);
  },
  updateChk: async function(pType,type,param){
    var change = 'cnt_chk_'+type+' = '+param[1];
    var sql = 'update cnt_f_'+pType+'detail set '+change+' where f_idx = ?';
    try {
      await funDB.getResult('a',sql,param[0]);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,param[0]);
    }
  },
  updateDetail: async function(type,param){
    var change = (type == 'all') ? 'cnt_img_1 = null,cnt_img_2 = null,cnt_img_3 = null':'cnt_img_'+param[1]+' = null';
    var sql = 'update cnt_f_detail set '+change+' where cnt_num = ?';
    try {
      await funDB.getResult('a',sql,param[0]);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,param[0]);
    }
  },
  udpateImg: async function(type,param){
    var where = (type == 'all') ? '':'and cnt_chknum = ?';
    var sql = 'update go_img set go_chk = \'0\' where go_chk != 0 '+where+' and go_regdate is not null and cnt_img_name!=\'untitled.jpg\' and cnt_url = ?';
    try {
      await funDB.getResult('a',sql,((type == 'all') ? param[1]:param));
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,((type == 'all') ? param[1]:param));
    }
  }
}

module.exports = monitoring;
