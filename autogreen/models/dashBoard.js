const mysql = require('mysql');
const DBpromise = require('../db/db_promise.js');

var DashBoard = {
  call_dashBoard: async function(type,param){
    var sql = "call site.dashboard"+type+"(?,?,?)";
    return await getResult2(sql,param);
  },
  getStatistics: async function(osp,cp){
    var sql = "SELECT u.U_name as cp_name,\
	   FORMAT(COUNT(d.K_apply),0) AS totalCount,\
    FORMAT(COUNT(IF(d.K_apply='T' and CS_state='1',1,null)),0) as TCount,\
    FORMAT(COUNT(IF(d.K_apply='T' and CS_state='0',1,null)),0) as TdCount,\
    FORMAT(COUNT(IF(d.K_apply='D' and CS_state='1',1,null)),0) as DCount,\
    FORMAT(COUNT(IF(d.K_apply='D' and CS_state='0',1,null)),0) as DdCount,\
    FORMAT(COUNT(IF(d.K_apply='P',1,null)),0) as PCount\
    FROM (select U_name from user_all_b where U_class='c' and U_state= '1' order by U_name) as u\
    left join (select * from dashboard where date(CS_regdate)=curdate()) as d\
    on u.U_name = d.U_name"

    if(cp != undefined){
      sql += " group by u.U_name";
    }

    var result = await getResult(osp,sql);
    if(result.length > 0){
      if(cp == undefined){
        return result[0];
      }
      return result;
    }

    return false;
  },
  getStatistics_: async function(osp,cp){
    var sql = "SELECT FORMAT(COUNT(*),0) AS totalCount,\
    FORMAT(COUNT(IF(K_apply='T' and CS_state='1',1,null)),0) as TCount,\
    FORMAT(COUNT(IF(K_apply='T' and CS_state='0',1,null)),0) as TdCount,\
    FORMAT(COUNT(IF(K_apply='D' and CS_state='1',1,null)),0) as DCount,\
    FORMAT(COUNT(IF(K_apply='D' and CS_state='0',1,null)),0) as DdCount,\
    FORMAT(COUNT(IF(K_apply='P',1,null)),0) as PCount\
    FROM dashboard where date(CS_regdate)=curdate()";
    if(cp != undefined){
      sql += " and U_name=?";
      var result = [].map.call(cp, async function(obj) {
        var rows = await getResult(osp,sql,obj.U_name);
        rows[0].cp_name = obj.U_name;
        // console.log(rows[0]);
        return rows[0];
      }).filter(function(n){ return n != undefined });
      // console.log(result);
      return result;
    }
    else{
      var result = await getResult(osp,sql);
      if(result.length > 0){
        return result[0];
      }
    }
    return false;
  },
  getCPList: async function(osp){
    var sql = 'select U_name from user_all_b where U_class=\'c\' and U_state= \'1\'';
    return await getResult(osp,sql+' order by U_name');
  },
  get24DataList: async function(osp){
    var sql = "call 24Data();"
    var result = await getResult(osp,sql);
    return [].map.call(result, function(obj) {
      if(obj[0] != undefined){
        return obj[0];
      }
    }).filter(function(n){ return n != undefined });
  },
  checkId: async function(id) {
    var sql = 'select * from user_all where U_id=? and U_state=?';
    var param = [id,'1'];
    return await getResult('site',sql,param);
  }
}

async function getResult(osp,sql,param) {
  var db = new DBpromise(osp);
  console.log('site : ',osp);
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

async function getResult2(sql,param) {
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
module.exports = DashBoard;
