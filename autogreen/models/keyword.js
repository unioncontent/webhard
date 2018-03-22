const mysql = require('mysql');
const promise = require('../db/db_promise.js');
// const info = require('../db/db_con.js');

var Keyword = {
  updateOneKeyword: function(item,callback){
    var sql = 'update cnts_kwd_f set ';
    sql += item['type'] + '=? where n_idx_c=?';
    delete  item['type'];
    var param = Object.values(item);
    var DBpromise = new promise(global.osp);
    console.log(sql,param);
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
  updateKeyword: function(item,callback){
    var sql = 'update cnts_kwd_f set K_method=?, K_key=?, K_apply=?';;
    if('delay_time' in item){
      sql += ', delay_time=?';
    }
    sql += ' where n_idx_c=?';
    var param = Object.values(item);
    console.log(sql,param);
    dbstart(sql,param,callback);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,param,callback);
    // var DBpromise = new promise(global.osp);
    // DBpromise.query(sql,param)
    // .then(rows => {
    //
    //   return callback(null,rows);
    // })
    // .then(rows => {
    //   DBpromise.close();
    // })
    // .catch(function (err) {
    //   DBpromise.close();
    //   return callback(err,null);
    // });
  },
  deleteKeyword: function(param,callback){
    var sql = 'delete from cnts_kwd_f where';
    if(param[1] == 'k_idx'){
      sql += ' n_idx=?';
    }
    else if(param[1] == 'cpId'){
      sql += ' U_id_c=?';
    }
    else{
      sql += ' n_idx_c=?';
    }
    console.log(sql,param[0]);
    dbstart(sql,param[0],callback);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,n_idx,callback);
    // var DBpromise = new promise(global.osp);
    // DBpromise.query(sql,param[0])
    // .then(rows => {
    //   return callback(null,rows);
    // })
    // .then(rows => {
    //   DBpromise.close();
    // })
    // .catch(function (err) {
    //   DBpromise.close();
    //   return callback(err,null);
    // });
  },
  insertKeyword: function(item,callback) {
    var param = [item.n_idx_c,item.U_id_c,item.keyword,item.K_apply,item.K_method,item.K_key,item.K_type,item.delay_time];
    var sql = 'insert into cnts_kwd_f(n_idx_c, U_id_c, K_keyword, K_apply, K_method, K_key, K_type, delay_time, K_regdate) values(?,?,?,?,?,?,?,?,now())';
    console.log(sql,param);
    dbstart(sql,param,callback);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,param,callback);
    // var DBpromise = new promise(global.osp);
    // DBpromise.query(sql,param)
    // .then(rows => {
    //
    //   return callback(null,rows);
    // })
    // .then(rows => {
    //   DBpromise.close();
    // })
    // .catch(function (err) {
    //   DBpromise.close();
    //   return callback(err,null);
    // });
  },
  getKeyInfo: function(idx,callback){
    var sql = 'select * from cnts_kwd_f where n_idx_c=?';
    console.log(sql,idx);
    dbstart(sql,idx,callback);
    // var connection = mysql.createConnection(info.changeDB(global.osp));
    // connection.query(sql,idx,callback);
    // var DBpromise = new promise(global.osp);
    // DBpromise.query(sql,idx)
    // .then(rows => {
    //   return callback(null,rows);
    // })
    // .then(rows => {
    //   DBpromise.close();
    // })
    // .catch(function (err) {
    //   DBpromise.close();
    //   return callback(err,null);
    // });
  },
  getCPKeywordCount: function(callback){
    var sql = 'SELECT STRAIGHT_JOIN a.U_name,a.U_id,\
    FORMAT(IF(CCount is null,0,CCount),0) as CCount,\
    FORMAT(COUNT(IF(k.K_type=\'1\',1,null)),0) as TCount,\
    FORMAT(COUNT(IF(k.K_type=\'0\',1,null)),0) as DCount\
    FROM user_all_b as a\
    left join  cnts_kwd_f as k\
    on a.U_id = k.U_id_c\
    left join (SELECT STRAIGHT_JOIN \
    U_id_c,count(distinct CP_title) as CCount\
    FROM cnts_list_c as c group by U_id_c) as c\
    on a.U_id = c.U_id_c\
    where a.U_class = \'c\' group by a.U_name';
    dbstart(sql,null,callback);
  },
  getCPKeyword: function(item,callback){
    console.log('getCPKeyword');
    var sql = 'select U_name from user_all_b where U_id=?';
    var DBpromise = new promise('fileham');
    var param = [item.cp,item.offset,item.limit];
    console.log(sql,param[0]);
    DBpromise.query(sql,param[0])
    .then(rows => {
      var name = rows[0]['U_name'];
      sql = 'select FORMAT(COUNT(*),0) as total,\
      FORMAT(COUNT(IF(K_method=\'1\',1,null)),0) as a,\
      FORMAT(COUNT(IF(K_method=\'0\',1,null)),0) as m,\
      FORMAT(COUNT(IF(K_key=\'1\',1,null)),0) as n,\
      FORMAT(COUNT(IF(K_key=\'0\',1,null)),0) as f\
      from (select * from cnts_kwd_f where U_id_c=? group by n_idx_c) as gTable';
      console.log(sql,param[0]);
      DBpromise.query(sql,param[0]).then(rows => {
        return [name,rows[0].total,rows[0].a,rows[0].m,rows[0].n,rows[0].f]
      }).then(rows => {
        var infoArr = rows;
        console.log('infoArr:',infoArr);
        sql = 'SELECT * from keyword where U_id_c=?';
        if('searchType' in item){
          switch (item.searchType) {
            case 'i': sql+=' and CP_CntID=\''+item.search+'\''; break;
            case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
          }
        }
        sql += ' limit ?,?';
        console.log(sql,param);
        DBpromise.query(sql,param).then(rows=> { return callback(null,rows,infoArr); })
        .then(rows => {
          console.log('getCPKeyword DB끝냄');
          DBpromise.close();
        })
        .catch(function (err) {
          console.log('에러:',err);
          DBpromise.close();
          if(err == null){
            return callback(null,[],infoArr);
          }
          return callback(err,null,infoArr);
        });
      });
    });
  },
  getCPKeywordPageTotal: function(item,callback){
    var sql = 'select count(1) as total from (select n_idx_c from keyword where U_id_c=? '
    if('searchType' in item){
      switch (item.searchType) {
        case 'i': sql+=' and CP_CntID=\''+item.search+'\''; break;
        case 't': sql+=' and search like \'%'+(item.search.replace(/ /gi, ""))+'%\''; break;
      }
    }
    sql += ' ) as a';
    dbstart(sql,item.cp,callback);
  }
}

function dbstart(sql,param,callback){
  var DBpromise = new promise(global.osp);
  DBpromise.query(sql,param)
  .then(rows => {
    return callback(null,rows);
  })
  .then(rows => {
    console.log('dbstart DB끝냄');
    DBpromise.close();
  })
  .catch(function (err) {
    DBpromise.close();
    console.log('에러:',err);
    return callback(err,null);
  });
}
module.exports = Keyword;
