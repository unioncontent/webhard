var dbInfo = {
  host     : '180.210.20.178',
  user     : 'autogreen',
  password : 'uni1004',
  port     : '3306',
  database : 'fileis'
};
var db = {
  getDBInfo : function(){
    return dbInfo;
  }
  setDatabase : function(name){
    dbInfo.database = name;
  }
};
module.exports = db;
