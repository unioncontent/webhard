const funDB = require('../db/db_fun.js');

var stats = {
  call_stats: async function(param){
    var sql = "call stats(?,?, ?, ?, ?, ?, ?, ?, ?, ?)";
    // call stats('0','','kbs', '', 'a.cnt_osp', '2018-11-01', '2018-11-01');
    return await funDB.getResult('b',sql,param);
  },
  selectTable: async function(body,param){
    var dateSql = "where cnt_f_regdate between '"+body['sDate']+"' and '"+body['eDate']+"'";
    var sql = "select c.cnt_title as ctitle,k.k_title,DATE_FORMAT(`a`.`cnt_date_1`,'%Y-%m-%d %H:%i:%s') AS `cnt_date`,a.* from (select 'pc' as plat,v1.* from cnt_view  as v1 "+dateSql+" \
    union all\
    select 'mobile' as plat,v2.* from cnt_m_view as v2 "+dateSql+" \
    ) as a\
    left join cnt_l_list as c on a.cnt_L_idx = c.n_idx\
    left join k_word as k on a.cnt_keyword = k.n_idx where k.k_state=1 and a.cnt_chk_1 != 2 ";

    // type
    if(body['type'] == 'p'){
      sql += " and a.plat = 'pc'";
    } else if(body['type'] == 'm'){
      sql += " and a.plat = 'mobile'";
    }
    // cnt_L_id
    if('cnt_L_id' in body){
      sql += ' and a.cnt_L_id = \''+body['cnt_L_id']+'\'';
    }
    // osp
    if('osp' in body){
      sql += ' and a.cnt_osp = \''+body['osp']+'\'';
    }
    // cp
    if('cp' in body){
      sql += ' and a.cnt_cp = \''+body['cp']+'\'';
    }
    // mcp
    if('mcp' in body){
      sql += ' and a.cnt_mcp = \''+body['mcp']+'\'';
    }
    // title
    if(body['title'] == '전체제휴건'){
      sql += " and a.cnt_chk_1 = '1'";
    } else if(body['title'] == '전체비제휴건'){
      sql += " and a.cnt_chk_1 = '0'";
    } else if(body['title'] == '비제휴잔류'){
      sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 is null and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 0 and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 0 and a.cnt_chk_3 = 0) or (a.cnt_chk_2 != 0 and a.cnt_chk_3 = 0))";
      // sql += " and a.cnt_chk_1 = 0 and (((a.cnt_chk_2 = 0 or a.cnt_chk_2 is null) and (a.cnt_chk_3 = 0 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 0 and a.cnt_chk_3 = 0))";
      //     비제휴잔류 a.cnt_chk_1 = 0 and (((a.cnt_chk_2 = 0 or a.cnt_chk_2 is null) and (a.cnt_chk_3 = 0 or a.cnt_chk_3 != 0 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 0 and a.cnt_chk_3 = 0))
    } else if(body['title'] == '삭제건'){
      sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 2 and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 2 and a.cnt_chk_3 = 2) or (a.cnt_chk_2 != 2 and a.cnt_chk_3 = 2))";
      // sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 2 and (a.cnt_chk_3 = 2 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 2 and a.cnt_chk_3 = 2))";
      // 삭제전환 a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 2 and (a.cnt_chk_3 = 2 or a.cnt_chk_3 != 2 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 2 and a.cnt_chk_3 = 2))
    } else if(body['title'] == '제휴전환건'){
      sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 1 and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 1 and a.cnt_chk_3 = 1) or (a.cnt_chk_2 != 1 and a.cnt_chk_3 = 1))";
      // 제휴전환 a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 1 and (a.cnt_chk_3 = 1 or a.cnt_chk_3 != 1 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 1 and a.cnt_chk_3 = 1))
    }

    // search
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and a.cnt_title_null like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'n': sql+=' and a.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and a.k_title like \'%'+body.search+'%\''; break;
      }
    }

    sql += "order by a.cnt_f_regdate desc limit ?,?";
    return await funDB.getResult('b',sql,param);
  },
  selectTableCount: async function(body,param){
    var dateSql = "where cnt_f_regdate between '"+body['sDate']+"' and '"+body['eDate']+"'";
    var sql = "select count(*) as total from (select 'pc' as plat,v1.* from cnt_view  as v1 "+dateSql+" \
    union all\
    select 'mobile' as plat,v2.* from cnt_m_view as v2 "+dateSql+" \
    ) as a\
    left join cnt_l_list as c on a.cnt_L_idx = c.n_idx\
    left join k_word as k on a.cnt_keyword = k.n_idx where k.k_state=1 and a.cnt_chk_1 != 2 ";

    // type
    if(body['type'] == 'p'){
      sql += " and a.plat = 'pc'";
    } else if(body['type'] == 'm'){
      sql += " and a.plat = 'mobile'";
    }
    // cnt_L_id
    if('cnt_L_id' in body){
      sql += ' and a.cnt_L_id = \''+body['cnt_L_id']+'\'';
    }
    // osp
    if('osp' in body){
      sql += ' and a.cnt_osp = \''+body['osp']+'\'';
    }
    // cp
    if('cp' in body){
      sql += ' and a.cnt_cp = \''+body['cp']+'\'';
    }
    // mcp
    if('mcp' in body){
      sql += ' and a.cnt_mcp = \''+body['mcp']+'\'';
    }
    // title
    if(body['title'] == '전체제휴건'){
      sql += " and a.cnt_chk_1 = '1'";
    } else if(body['title'] == '전체비제휴건'){
      sql += " and a.cnt_chk_1 = '0'";
    } else if(body['title'] == '비제휴잔류'){
      sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 is null and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 0 and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 0 and a.cnt_chk_3 = 0) or (a.cnt_chk_2 != 0 and a.cnt_chk_3 = 0))";
      // sql += " and a.cnt_chk_1 = 0 and (((a.cnt_chk_2 = 0 or a.cnt_chk_2 is null) and (a.cnt_chk_3 = 0 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 0 and a.cnt_chk_3 = 0))";
      //     비제휴잔류 a.cnt_chk_1 = 0 and (((a.cnt_chk_2 = 0 or a.cnt_chk_2 is null) and (a.cnt_chk_3 = 0 or a.cnt_chk_3 != 0 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 0 and a.cnt_chk_3 = 0))
    } else if(body['title'] == '삭제건'){
      sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 2 and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 2 and a.cnt_chk_3 = 2) or (a.cnt_chk_2 != 2 and a.cnt_chk_3 = 2))";
      // sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 2 and (a.cnt_chk_3 = 2 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 2 and a.cnt_chk_3 = 2))";
      // 삭제전환 a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 2 and (a.cnt_chk_3 = 2 or a.cnt_chk_3 != 2 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 2 and a.cnt_chk_3 = 2))
    } else if(body['title'] == '제휴전환건'){
      sql += " and a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 1 and a.cnt_chk_3 is null) or (a.cnt_chk_2 = 1 and a.cnt_chk_3 = 1) or (a.cnt_chk_2 != 1 and a.cnt_chk_3 = 1))";
      // 제휴전환 a.cnt_chk_1 = 0 and ((a.cnt_chk_2 = 1 and (a.cnt_chk_3 = 1 or a.cnt_chk_3 != 1 or a.cnt_chk_3 is null)) or (a.cnt_chk_2 != 1 and a.cnt_chk_3 = 1))
    }

    // search
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and a.cnt_title_null like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'n': sql+=' and a.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and a.k_title like \'%'+body.search+'%\''; break;
      }
    }
    var count = await funDB.getResult('b',sql,param);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  }
}
module.exports = stats;
