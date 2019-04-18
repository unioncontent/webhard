const logger = require('../winston/config_f.js');
let mysql = require('mysql');
let funDB = require('../db/db_fun.js');

var img = {
  imgUpdate: async function(pType,data){
    var sql = 'update go_'+pType+'img set go_updateTime = now(),go_chk = ? ';
    sql += 'where cnt_url = ?';
    if(data[0] == '1' || (data[0] == '2' && data[2] == '3')){
      sql += ' and cnt_chknum = ? ';
    }
    else if(data[0] == '2' || data[2] == '2'){
      sql += ' and (cnt_chknum = ? or cnt_chknum = ?)';
      data.push('3');
    }
    return await funDB.getResult(sql,data);
  },
  detailImgUpdate: async function(pType,num,data){
    var sql = 'update cnt_f_'+pType+'detail set cnt_chk_'+num+' = 0, cnt_img_'+num+' = ? ';
    if(num == '1'){
      sql += ' where cnt_url = ? and (cnt_img_2 != \'/untitled.jpg\' or cnt_img_2 is null) and (cnt_img_3 != \'/untitled.jpg\' or cnt_img_3 is null) ';
    }
    else if(num == '2'){
      sql += ' where cnt_url = ? and (cnt_img_3 != \'/untitled.jpg\' or cnt_img_3 is null) ';
    }
    else{
      sql += 'where cnt_url = ?';
    }
    // logger.info(mysql.format(sql, data)+';');
    return await funDB.getResult(sql,data);
  }
};
module.exports = img;
