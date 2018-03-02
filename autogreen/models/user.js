var mysql = require('mysql');
var info = require('../db/db_con.js');
var connection = mysql.createConnection(info.init);

var User = {
  getUserList : function(user,callback) {
    var sql = 'select * from user_all where U_class=? order by n_idx desc limit ?,?';
    if(user.uClass == 'a'){
      sql = 'select * from user_all order by n_idx desc limit ?,?';
      delete user.uClass;
    }
    var param = Object.values(user);
    connection.query(sql,param,callback);
  },
  getClassAllList : function(uClass,callback) {
    var sql = 'select * from user_all where U_class=?  order by U_name';
    connection.query(sql,uClass,callback);
  },
  getClassList : function(c,callback) {
    var sql = 'select U_name from user_all where U_class=? and U_state= \'1\'';
    connection.query(sql,c,callback);
  },
  getUserName : function(uid,callback) {
    var sql = 'select U_name from user_all where n_idx=?';
    connection.query(sql,uid,callback);
  },
  checkOCId : function(item,callback) {
    var sql = 'select * from user_all where U_id=? and U_class=\'o\'';
    if(item[0] == 'c'){
      sql = 'select * from user_all where U_id=? and U_class=\'c\'';
    }
    console.log(sql,item[1]);
    connection.query(sql,item[1],callback);
  },
  userCount : function(uClass,callback) {
    var sql = 'select count(1) as total from user_all where U_class=?';
    if(uClass == 'a'){
      sql = 'select count(1) as total from user_all';
      connection.query(sql, callback);
    }
    else{
      connection.query(sql, uClass, callback);
    }
  },
  updateUser : function(userArr,callback) {
    connection.query('update user_all_b set U_name=?,U_pw=?,U_state=? where U_id=?',userArr, callback);
  },
  insertUser: function(userArr,callback) {
    connection.query('insert user_all_b(U_id, U_pw, U_class, U_name, U_state, U_regdate) values(?,?,?,?,?,?)',userArr, callback);
  },
  checkId: function(id,callback) {
    connection.query('select * from user_all where U_id=? and U_state= \'1\'',id, callback);
  }
}

module.exports = User;
