const mysql = require('mysql');
const promise = require('../db/db_promise.js');
// const info = require('../db/db_con.js');

var User = {
  getUserList : function(user,callback) {
    var sql = 'select * from user_all_b where U_class=? order by n_idx desc limit ?,?';
    if(user.uClass == 'a'){
      sql = 'select * from user_all_b order by n_idx desc limit ?,?';
      delete user.uClass;
    }
    var param = Object.values(user);
    // console.log(sql,param);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,param,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,param)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  getClassAllList : function(uClass,callback) {
    var sql = 'select * from user_all_b where U_class=? order by n_idx desc';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,uClass,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,uClass)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  getCpAllList : function(callback) {
    var sql = 'select * from user_all_b where U_class=\'c\' order by U_name';
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  getClassList : function(c,callback) {
    var sql = 'select U_name from user_all_b where U_class=? and U_state= \'1\'';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,c,callback);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,c)
    .then(rows => {

      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  checkName : function(item,callback) {
    var sql = 'select * from user_all_b where U_name=? and U_class=?';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,item[1],callback);
    var DBpromise = new promise(global.osp);
    console.log(sql,item);
    DBpromise.query(sql,item)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  userCount : function(uClass,callback) {
    var sql = 'select count(1) as total from user_all_b where U_class=?';
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql, callback);
    var param = uClass;
    if(uClass == 'a'){
      sql = 'select count(1) as total from user_all_b';
      param = null;
    }
    var DBpromise = new promise(global.osp);
    console.log(sql,param);
    DBpromise.query(sql,param)
    .then(rows => {
      console.log(rows);
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  },
  checkId: function(id,callback) {
    var sql = 'select * from user_all where U_id=? and U_state=? and U_class!=?';
    var param = [id,'1','c'];
    // var connection = mysql.createConnection(info.changeDB('webhard'));
    // connection.query(,id, callback);
    var DBpromise = new promise('webhard');
    DBpromise.query(sql,param)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      return callback(err,null);
    });
  }
}

module.exports = User;
