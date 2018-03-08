const mysql = require('mysql');
const promise = require('../db/db_promise.js');

var DashBoard = {
  getAllDataCount: function(item,callback){
    console.log('getAllDataCount');
    var sql = "SELECT FORMAT(COUNT(*),0) AS total,\
    FORMAT(COUNT(IF(K_apply='T' and CS_state='1',1,null)),0) as tTotal,\
    FORMAT(COUNT(IF(K_apply='D' and CS_state='1',1,null)),0) as dTotal,\
    FORMAT(COUNT(IF(K_apply='P',1,null)),0) as pTotal\
    FROM dashboard where date(CS_regdate) = date(now()) ";
    if(item != ''){
      sql += "and U_id_c=?"
    }
    // console.log(sql,item);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,item,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,item)
    .then(rows => {
      return callback(rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      console.log(err);
    });
  },
  get24DataList: function(callback){
    // var sql = "SELECT FORMAT(COUNT(IF(K_apply='T' and CS_state='1',1,null)),0) as tTotal,\
    // FORMAT(COUNT(IF(K_apply='D' and CS_state='1',1,null)),0) as dTotal,\
    // FORMAT(COUNT(IF(K_apply='P',1,null)),0) as pTotal,\
    // DATE_FORMAT(CS_regdate,'%Y-%m-%d %H:00:00') as date\
    // FROM dashboard where CS_regdate > DATE_ADD(now(), INTERVAL -24 HOUR)\
    // group by hour(CS_regdate);";
    var sql = "call 24Data();"
    // console.log(sql);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql)
    .then(rows => {
      // console.log(rows);
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      return callback(err,null);
    });
  }
}

module.exports = DashBoard;
