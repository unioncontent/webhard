const mysql = require('mysql');
const info = require('../db/db_con.js');

var User = {
  getUserList : function(user,callback) {
    var sql = 'select * from user_all_b where U_class=? order by U_regdate desc limit ?,?';
    if(user.uClass == 'a'){
      sql = 'select * from user_all_b order by U_regdate desc limit ?,?';
      delete user.uClass;
    }
    var param = Object.values(user);
    console.log(sql,param);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,param,callback);

  },
  getClassAllList : function(uClass,callback) {
    var sql = 'select * from user_all_b where U_class=? order by U_regdate desc';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,uClass,callback);

  },
  getClassList : function(c,callback) {
    var sql = 'select U_name from user_all_b where U_class=? and U_state= \'1\'';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,c,callback);

  },
  checkOCId : function(item,callback) {
    var sql = 'select * from user_all_b where U_id=? and U_class=\'o\'';
    if(item[0] == 'c'){
      sql = 'select * from user_all_b where U_id=? and U_class=\'c\'';
    }
    console.log(sql,item[1]);
    var connection = mysql.createConnection(info.changeDB(global.osp));
    connection.query(sql,item[1],callback);

  },
  userCount : function(uClass,callback) {
    var sql = 'select count(1) as total from user_all_b where U_class=?';
    var connection = mysql.createConnection(info.changeDB(global.osp));
    if(uClass == 'a'){
      sql = 'select count(1) as total from user_all_b';
      connection.query(sql, callback);
    }
    else{
      connection.query(sql, uClass, callback);
    }

  },
  checkId: function(id,callback) {
    var connection = mysql.createConnection(info.changeDB('webhard'));
    connection.query('select * from user_all where U_id=? and U_state= \'1\'',id, callback);

  }
}

module.exports = User;
