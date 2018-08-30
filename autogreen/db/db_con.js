// const host = '192.168.0.43';
const host = '61.82.113.197';
const user = 'autogreen';
const password = 'uni1004';
const port = '3307';

var environments = {
  mysql : {
    host     : host,
    user     : user,
    password : password,
    port     : port,
    database : 'site'
  },
  changeDB : function(name){
    this.mysql.database = name || 'site';
    return this.mysql;
  }
}

module.exports = environments;
