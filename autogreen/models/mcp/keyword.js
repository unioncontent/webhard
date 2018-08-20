const mysql = require('mysql');
const DBpromise = require('../../db/db_promise.js');

var Keyword = {
  insert: async function(param) {
    var pValue = Object.values(param);
    var sql = insertSqlSetting(Object.keys(param));
    return await getResult(sql,pValue);
  },
  updateCpKeyKeyword: async function(param){
    var sql = 'update cnts_kwd_f set K_key=? where U_id_c=?';
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
  updateOneKeyword: async function(param){
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
  update: async function(param){
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
  delete: async function(param){
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
  getKeyInfo: async function(idx){
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
  getCPKeywordCount: async function(){
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
  getCPKeyword: async function(param){
    console.log('getCPKeyword');
    var sql = 'select U_name from user_all_b where U_id=?';
    var DBpromise = new promise(global.osp);
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
        sql += ' ORDER BY CP_regdate DESC limit ?,?';
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
  getCPKeywordPageTotal: async function(param){
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

function insertSqlSetting(keys){
  var arr = [].map.call(keys, function(obj) { return '?'; });
  columns = keys.join(', ');
  placeholders = arr.join(', ');
  var sql = "INSERT INTO k_word ( "+columns+" ) VALUES ( "+placeholders+" );";

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

module.exports = Keyword;
