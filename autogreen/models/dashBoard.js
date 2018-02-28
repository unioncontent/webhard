var mysql = require('mysql');
var connection = mysql.createConnection(require('../db/db_con.js'));

var DashBoard = {
  view: function(){
    return global.osp.replace('_admin','') + '_dashboard';
  },
  getAllDataCount: function(item,callback){
    var sql = "SELECT FORMAT(COUNT(*),0) AS total,\
    FORMAT(COUNT(IF(K_apply='T' and CS_state='1',1,null)),0) as tTotal,\
    FORMAT(COUNT(IF(K_apply='D' and CS_state='1',1,null)),0) as dTotal,\
    FORMAT(COUNT(IF(K_apply='P',1,null)),0) as pTotal\
    FROM "+this.view()+" where date(CS_regdate) = date(now()) ";
    if(item != ''){
      sql += "and U_id_c=?"
    }
    // console.log(sql,item);
    connection.query(sql,item,callback);
  },
  get24DataList: function(callback){
    var sql = "SELECT FORMAT(COUNT(IF(K_apply='T' and CS_state='1',1,null)),0) as tTotal,\
    FORMAT(COUNT(IF(K_apply='D' and CS_state='1',1,null)),0) as dTotal,\
    FORMAT(COUNT(IF(K_apply='P',1,null)),0) as pTotal,\
    DATE_FORMAT(CS_regdate,'%Y-%m-%d %H:00:00') as date\
    FROM "+this.view()+" where CS_regdate > DATE_ADD(now(), INTERVAL -24 HOUR)\
    group by hour(CS_regdate);";

    // console.log(sql);
    connection.query(sql,callback);
  }
}

module.exports = DashBoard;
