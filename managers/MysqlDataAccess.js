const fs = require('fs');
const mysql = require('mysql');

module.exports = class MysqlDataAccess {
    constructor(mysqlHost, mysqlUser, mysqlPassword, mysqlDatabase) {
        this.mysqlHost = mysqlHost;
        this.mysqlUser = mysqlUser;
        this.mysqlPassword = mysqlPassword;
        this.mysqlDatabase = mysqlDatabase;
        this.multipleStatements = true;

        this.connection = null;
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

    async getNextPieceToScrap() {
        const sql = "select * from scraping_pieces_index where scraped = false order by piece_id asc limit 1;";
        const result = await this.runQuery(sql);
        return result[0];
    }

    async countIndexEntries() {
        const sql = "select count(*) from scraping_pieces_index";
        let result;
        try {
            result = await this.runQuery(sql);
            return parseInt(result[0]["count(*)"]);
        } catch (err) {
            return null;
        }
    }

    async getScrapedCities(scraping_id) {
        const sql = `select r.city_name from scraping_pieces_index r left join scraping_results t on  t.piece_id = r.piece_id
        where t.scraping_id = "${scraping_id}"
        group by r.city_name`;
        const result = await this.runQuery(sql);
        return result;
    }

    async getScrapingResultsCity(city_name, scraping_id) {
        const sql = `select t.*, s.* from scraping_results t ,scraping_pieces_index s where
        t.piece_id = s.piece_id and 
        t.scraping_id = "${scraping_id}"
        and s.city_name = "${city_name}";`;
        const result = await this.runQuery(sql);
        return result;
    }

    async getScrapingResults(limit, offset, order = "asc") {
        const sql = `select * from scraping_results left join scraping_pieces_index on scraping_results.piece_id = scraping_pieces_index.piece_id
        order by date_scraped ${order}
        limit ${limit}
        offset ${offset};`;
        try {
            result = await this.runQuery(sql);
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getScrapingExecutionLog(limit, offset, order = "desc") {
        const sql = `select t.*, r.date_scraped, r.app_id, r.device_id from scraping_execution_log t, scraping_results r 
        where t.last_piece = r.piece_id
        order by r.date_scraped ${order}
        limit ${limit}
        offset ${offset};`;
        try {
            const result = await this.runQuery(sql);
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getScrapedCount(device_id, scraped) {
        const sql = `select count(*) from scraping_pieces_index 
        where scraped=${scraped} and  
        device_id = "${device_id}";`
        try {
            const result = await this.runQuery(sql);
            return parseInt(result[0]["count(*)"]);
        } catch (err) {
            return null;
        }
    }

    //select * from scraping_execution_log where scraping_id = "";
    async getLastPiece(scraping_id) {
        const sql = `select * from scraping_execution_log where scraping_id = "${scraping_id}";`
        try {
            const result = await this.runQuery(sql);
            return result;
        } catch (err) {
            return null;
        }
    }

    //select device_id from scraping_pieces_index group by device_id;
    async listDevices(scraping_id) {
        const sql = `select device_id from scraping_pieces_index group by device_id`
        try {
            const result = await this.runQuery(sql);
            return result;
        } catch (err) {
            return null;
        }
    }
}