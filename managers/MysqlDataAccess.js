const fs = require('fs');
const mysql = require('mysql');

module.exports = class MysqlDataAccess {
    constructor(mysqlHost = process.env["MYSQL_HOST"], mysqlUser = process.env["MYSQL_USER"], mysqlPassword = process.env["MYSQL_PASSWORD"], mysqlDatabase = process.env["MYSQL_DATABASE"], sqlCreationPath = "./scripts/initalize.sql") {
        this.mysqlHost = mysqlHost;
        this.mysqlUser = mysqlUser;
        this.mysqlPassword = mysqlPassword;
        this.mysqlDatabase = mysqlDatabase;
        this.multipleStatements = true;

        this.connection = null;
        this.tableCreatorScriptPath = sqlCreationPath;
        this.createConnection();
    }

    createConnection() {
        console.log("creating connection " + this.mysqlHost + " " + this.mysqlUser + " " + this.mysqlPassword + " " + this.mysqlDatabase)
        this.connection = mysql.createConnection({
            host: this.mysqlHost,
            user: this.mysqlUser,
            password: this.mysqlPassword,
            database: this.mysqlDatabase,
            multipleStatements: this.multipleStatements
        });
    }
    async runQuery(script) {
        const connection = this.connection;
        return new Promise((resolve, reject) => {
            connection.query(script, function (err, rows, fields) {
                if (!err) {
                    resolve(rows);
                } else {
                    reject(err);
                    console.log('Error while performing Query.');
                    console.log(err);
                }
            });
        });
    }

    async runQueryWithInput(script, array) {
        const connection = this.connection;
        return new Promise((resolve, reject) => {
            connection.query(script, array, function (err, rows, fields) {
                if (!err) {
                    resolve(rows);
                } else {
                    reject(err);
                    console.log('Error while performing Query.');
                    console.log(err);
                }
            });
        });
    }

}
