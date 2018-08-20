const mysql = require('mysql');
const promise = require('../../db/db_promise.js');
// const info = require('../../db/db_con.js');

var Delay = {
  getDelayList : function(item,callback) {
    var sql = 'select * from delay';
    var param = [item.offset,item.limit];
    if('offset' in item){
      sql += ' order by OSP_delaydate desc limit ?,?'
    }
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
  delayCount : function(item,callback) {
    var sql = 'select count(1) as total from delay';
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql)
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
  insertDelay : function(item,callback){
    console.log('insertDelay');
    console.log('item : ',item);
    var sql = 'insert into cnts_delay_a(OSP_idx, n_idx_f, U_id_c, OSP_regdate, OSP_delaydate, OSP_price, OSP_title, OSP_filename, CS_state, K_apply)\
    SELECT s.OSP_idx, s.n_idx_f, s.U_id_c,a.OSP_regdate, DATE_ADD(now(),INTERVAL '+item.delay+' MINUTE) as OSP_delaydate,a.OSP_price, a.OSP_title,a.OSP_filename,s.CS_state,\''+item.apply+'\' FROM fileham.cnts_sort_e as s left join fileham.cnts_all_a as a on s.OSP_idx = a.OSP_idx where s.OSP_idx = ?;';
    console.log(sql,item.idx);
    var DBpromise = new promise(global.osp);
    DBpromise.query(sql,item.idx)
    .then(rows => {
      return callback(null,rows);
    })
    .then(rows => {
      DBpromise.close();
    })
    .catch(function (err) {
      DBpromise.close();
      console.log(err);
      return callback(err,null);
    });
  }
}

module.exports = Delay;
