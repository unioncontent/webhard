const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var sales = {
  call_sales: async function(param){
    var sql = "call site.sales(?,?,?,?,?)";
    return await getResult(sql,param);
  },
  selectDetail: async function(param){
    var whereQuery = "where s_osp = '"+param['osp']+"'";
    if('cp' in param){
      whereQuery += ' and s_cp = \''+param['cp']+'\'';
    }
    if('mcp' in param){
      whereQuery += ' and s_mcp = \''+param['mcp']+'\'';
    }
    if(('sDate' in param) && ('eDate' in param)){
      whereQuery+=" and DATE_FORMAT(STR_TO_DATE(s_settlement_date,'%Y-%m'), '%Y-%m') between '"+param['sDate']+"' and '"+param['eDate']+"' ";
    }
    var sql = "select n_idx, s_mcp, s_cp, s_osp, s_cnt_num, s_title,DATE_FORMAT(STR_TO_DATE(s_settlement_date,'%Y-%m'), '%Y-%m') as s_settlement_date, s_regdate, format(sum(s_total_money),0) as s_total_money, format(sum(s_total_sales),0) as s_total_sales, format(sum(s_settlement_money),0) as s_settlement_money from sales "+whereQuery+" group by STR_TO_DATE(s_settlement_date,'%Y-%m') order by STR_TO_DATE(s_settlement_date,'%Y-%m') desc";
    if(!('type' in param)){
      sql += " limit ?,?";
      return await getResult(sql,[param['limit'],param['offset']]);
    }
    else{
      return await getResult(sql);
    }
  },
  selectDetailCount: async function(param){
    var whereQuery = "where s_osp = '"+param['osp']+"'";
    if('cp' in param){
      whereQuery += ' and s_cp = \''+param['cp']+'\'';
    }
    if('mcp' in param){
      whereQuery += ' and s_mcp = \''+param['mcp']+'\'';
    }
    if(('sDate' in param) && ('eDate' in param)){
      whereQuery+=" and DATE_FORMAT(STR_TO_DATE(s_settlement_date,'%Y-%m'), '%Y-%m') between '"+param['sDate']+"' and '"+param['eDate']+"' ";
    }
    var sql = "select count(*) as total from (select * from sales "+whereQuery+" group by STR_TO_DATE(s_settlement_date,'%Y-%m') order by STR_TO_DATE(s_settlement_date,'%Y-%m') desc) a";
    var count = await getResult(sql);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  selectCnt: async function(param){
    var sql = "select * from cnt_l_list where cnt_id  like '%"+param+"%' or replace(cnt_title,' ','') like '%"+param+"%'";
    return await getResult(sql);
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  insertExcel: async function(values){
    var sql = "INSERT INTO sales (s_mcp, s_cp, s_osp, s_cnt_num, s_title, s_total_money, s_total_sales, s_settlement_money, s_settlement_date) VALUES ?";
    Promise.all(values).then(async function(v) {
      return await getResult(sql,[v]);
    }).catch(function(err){
      console.error("Promise.all error", err);
      return;
    });
  }
}
function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO sales ( "+columns+" ) VALUES ( "+placeholders+" );";

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

module.exports = sales;
