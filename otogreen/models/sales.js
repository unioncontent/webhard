const funDB = require('../db/db_fun.js');

var sales = {
  call_sales: async function(param){
    var sql = "call sales(?,?,?,?,?)";
    return await funDB.getResult('b',sql,param);
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
    var sql = "select n_idx, s_mcp, s_cp, s_osp, format(sum(s_mg),0) as s_mg, format(sum(s_rate),0) as s_rate,DATE_FORMAT(STR_TO_DATE(s_settlement_date,'%Y-%m'), '%Y-%m') as s_settlement_date, s_regdate, format(sum(s_total_money),0) as s_total_money, format(sum(s_total_sales),0) as s_total_sales, format(sum(s_settlement_money),0) as s_settlement_money from sales "+whereQuery+" group by STR_TO_DATE(s_settlement_date,'%Y-%m') order by STR_TO_DATE(s_settlement_date,'%Y-%m') desc";
    // var sql = "select n_idx, s_mcp, s_cp, s_osp, s_cnt_num, s_title, format(sum(s_mg),0) as s_mg, format(sum(s_rate),0) as s_rate,DATE_FORMAT(STR_TO_DATE(s_settlement_date,'%Y-%m'), '%Y-%m') as s_settlement_date, s_regdate, format(sum(s_total_money),0) as s_total_money, format(sum(s_total_sales),0) as s_total_sales, format(sum(s_settlement_money),0) as s_settlement_money from sales "+whereQuery+" group by STR_TO_DATE(s_settlement_date,'%Y-%m') order by STR_TO_DATE(s_settlement_date,'%Y-%m') desc";
    if(!('type' in param)){
      sql += " limit ?,?";
      return await funDB.getResult('b',sql,[param['limit'],param['offset']]);
    }
    else{
      return await funDB.getResult('b',sql);
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
    var count = await funDB.getResult('b',sql);
    if(count.length == 0){
      return 0;
    }
    else{
      return count[0]['total'];
    }
  },
  getInfo: async function(param){
    var sql = "select * from sales where n_idx = ?";
    return await funDB.getResult('b',sql,param);
  },
  selectCnt: async function(param){
    var sql = "select * from cnt_l_list where cnt_id  like '%"+param+"%' or replace(cnt_title,' ','') like '%"+param+"%'";
    return await funDB.getResult('b',sql);
  },
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await funDB.getResult('b',sql,pValue);
  },
  delete: async function(n_idx){
    var sql = 'delete from sales where n_idx=?';
    try {
      await funDB.getResult('a',sql,n_idx);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,n_idx);
    }
  },
  update: async function(param) {
    var idx = param.idx;
    delete param.idx;
    var arr = [].map.call(Object.keys(param), function(obj) { return obj+'=?'; });
    placeholders = arr.join(', ');
    var pValue = Object.values(param);
    pValue.push(idx);
    var sql = "update sales set "+placeholders+" where n_idx=?;";
    try {
      await funDB.getResult('a',sql,pValue);
    } catch (e) {
      console.log(e)
    } finally {
      return await funDB.getResult('b',sql,pValue);
    }
  },
  insertExcel: async function(values){
    var sql = "INSERT INTO sales (s_mcp, s_cp, s_osp, s_total_money, s_total_sales,s_mg,s_rate, s_settlement_money, s_settlement_date) VALUES ?";
    // var sql = "INSERT INTO sales (s_mcp, s_cp, s_osp, s_cnt_num, s_title, s_total_money, s_total_sales,s_mg,s_rate, s_settlement_money, s_settlement_date) VALUES ?";
    Promise.all(values).then(async function(v) {
      return await funDB.getResult('b',sql,[v]);
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

module.exports = sales;
