// const host = '192.168.0.43';
const host = '192.168.0.5';
const user = 'autogreen';
const password = 'uni1004';
const port = '3307';

var environments = {
  mysql : {
    host     : host,
    user     : user,
    password : password,
    port     : port,
    database : 'webhard'
  },
  changeDB : function(name){
    this.mysql.database = name || 'webhard';
    return this.mysql;
  }
}

module.exports = environments;
