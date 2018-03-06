const mysql = require('mysql');
const info = require('../db/db_con.js');

class Database {
    constructor(config) {
      this.UserConnection = mysql.createConnection(info.changeDB('webhard'));
      this.connection = mysql.createConnection(info.changeDB(config));
    }
    userQuery(sql, args) {
        return new Promise((resolve, reject) => {
            this.UserConnection.query(sql, args, (err, rows) => {
                if (err || rows.length == 0)
                    return reject(err);
                resolve(rows);
            });
        });
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
    userClose() {
        return new Promise((resolve, reject) => {
            this.UserConnection.end(err => {
                if (err)
                    return reject(err);
                resolve();
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
