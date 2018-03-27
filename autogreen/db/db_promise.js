const mysql = require('mysql');
const info = require('../db/db_con.js');

class Database {
    constructor(config) {
      this.connection = mysql.createConnection(info.changeDB(config));
    }
    query(sql, args) {
      return new Promise((resolve, reject) => {
          this.connection.query(sql, args, (err, rows) => {
              if (err || rows.length == 0)
                  return reject(err);
              resolve(rows);
          });
      });
    }
    close() {
      return new Promise((resolve, reject) => {
          this.connection.end(err => {
              if (err)
                  return reject(err);
              resolve();
          });
      });
    }
}

module.exports = Database;
