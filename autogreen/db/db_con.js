// var dbInfo = {
//   host     : '192.168.0.43',
//   user     : 'autogreen',
//   password : 'uni1004',
//   port     : '3306',
//   database : 'webhard'
// };

const host = '192.168.0.43';
const user = 'autogreen';
const password = 'uni1004';
const port = '3306';

var environments = {
  init : {
    host     : host,
    user     : user,
    password : password,
    port     : port,
    database : 'webhard'
  },
  mysql : {
    host     : host,
    user     : user,
    password : password,
    port     : port,
    database : ''
  }
}

module.exports = environments;
