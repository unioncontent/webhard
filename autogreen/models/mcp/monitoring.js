const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var monitoring = {
  callMonitoring: async function(param){
    var sql = "call site.monitoring(?,?,?,?,?,?,?,?,?,?)";
    // call site.monitoring('1',' and f.cnt_mcp = \'kbs\'','','2018-12-17 00:00:00', '2018-12-19 23:59:59', '0', '20')
    return await getResult(sql,param);
  },
  selectExcel: async function(body,param){
    var sql = "select b.* from (select f.n_idx,f.cnt_L_idx, f.cnt_L_id, f.cnt_num, f.cnt_osp, f.cnt_title as title, f.cnt_url, f.cnt_price, f.cnt_writer, f.cnt_vol, f.cnt_cate, f.cnt_fname, f.cnt_mcp, f.cnt_cp, f.cnt_keyword, f.cnt_f_regdate,o.osp_sname,o.osp_tstate,k.k_title,c.cnt_title as cnt_title,SUBSTRING_INDEX(d.cnt_img_1, '/', 2) AS path,\
        d.cnt_img_1,d.cnt_img_2,d.cnt_img_3,\
        DATE_FORMAT(d.cnt_date_1, '%Y-%m-%d %H:%i:%s') AS cnt_date_1,DATE_FORMAT(d.cnt_date_2, '%Y-%m-%d %H:%i:%s') AS cnt_date_2,DATE_FORMAT(d.cnt_date_3, '%Y-%m-%d %H:%i:%s') AS cnt_date_3,\
        d.cnt_chk_1,d.cnt_chk_2,d.cnt_chk_3\
        from cnt_f_list as f\
    		left join cnt_f_detail as d ON f.n_idx = d.f_idx\
    		join osp_o_list as o on f.cnt_osp = o.osp_id\
    		left join k_word as k on f.cnt_keyword = k.n_idx\
    		left join cnt_l_list as c on f.cnt_L_idx = c.n_idx\
        where  o.osp_tstate = ? ";
    if('cp' in body){
      sql += ' and f.cnt_cp = \''+body['cp']+'\'';
    }
    if('mcp' in body){
      sql += ' and f.cnt_mcp = \''+body['mcp']+'\'';
    }
    if('searchType' in body){
      switch (body.searchType) {
        case 't': sql+=' and replace(f.cnt_title,\' \', \'\') like \'%'+body.search.replace(/ /gi, '')+'%\''; break;
        case 'c': sql+=' and f.cnt_L_id =\''+body.search+'\''; break;
        case 'n': sql+=' and f.cnt_num =\''+body.search+'\''; break;
        case 'k': sql+=' and k.k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and f.cnt_f_regdate between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += "order by f.n_idx desc)  b join cnt_f_list a on b.n_idx = a.n_idx";
    return await getResult(sql,param);
  },
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
    left join site.k_word as k on b.cnt_keyword = k.n_idx\
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
        case 'k': sql+=' and k.k_title =\''+body.search+'\''; break;
      }
    }
    if(('sDate' in body) && ('eDate' in body)){
      sql+=' and a.cnt_date_1 between \''+body.sDate+' 00:00:00\' and \''+body.eDate+' 23:59:59\'';
    }
    sql += ' order by a.f_idx desc ';
    return await getResult(sql,param);
  },
  selectImage_: async function(body,param){
    // if((a.cnt_img_1 is not null and a.cnt_img_1 != '/untitled.jpg'),a.cnt_img_1,'') as cnt_img_name1
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
  },
  updateDetail: async function(type,param){
    var change = (type == 'all') ? 'cnt_img_1 = null,cnt_img_2 = null,cnt_img_3 = null':'cnt_img_'+param[1]+' = null';
    var sql = 'update cnt_f_detail set '+change+' where cnt_num = ?';
    return await getResult(sql,param[0]);
  },
  udpateImg: async function(type,param){
    var where = (type == 'all') ? '':'and cnt_chknum = ?';
    var sql = 'update go_img set go_chk = \'0\' where go_chk != 0 '+where+' and go_regdate is not null and cnt_img_name!=\'untitled.jpg\' and cnt_url = ?';
    return await getResult(sql,((type == 'all') ? param[1]:param));
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
