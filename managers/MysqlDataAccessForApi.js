const fs = require('fs');
const mysql = require('mysql');
const MysqlDataAccess = require("./MysqlDataAccess");
module.exports = class MysqlDataAccessForApi extends MysqlDataAccess{
    constructor(mysqlHost = process.env["MYSQL_HOST"], mysqlUser = process.env["MYSQL_USER"], mysqlPassword = process.env["MYSQL_PASSWORD"], mysqlDatabase = process.env["MYSQL_DATABASE"]) {
        super(mysqlHost,mysqlUser,mysqlPassword,mysqlDatabase);
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

    async getScrapingResultsCityFromLastApprovedId(city_name, app_id="fotocasa", method="boundingBox") {
        /*
        const sql = `select t.*, s.* from scraping_results t ,scraping_pieces_index s where
        t.piece_id = s.piece_id and 
        t.scraping_id = (select c.scraping_id from completed_revised_executions c, scraping_results s
						where c.revised=true
                        and s.scraping_id = c.scraping_id
                        and s.app_id = "${app_id}"
                        order by revised_date desc limit 1)
        and s.city_name = "${city_name}";`;
        */
        const sql = `
        SET sql_mode = '';        
        select t.*, s.* from scraping_results t ,scraping_pieces_index s, completed_revised_executions c where
        t.piece_id = s.piece_id and 
        t.scraping_id = (select c.scraping_id from completed_revised_executions c, scraping_results s, scraping_pieces_index i
						where c.revised=true
                        and s.scraping_id = c.scraping_id
                        and i.piece_id = s.piece_id
                        and s.app_id ="${app_id}"
                        and i.method = "${method}"
                        and i.city_name="${city_name}"
                        group by i.city_name
                        order by revised_date desc limit 1);
        `
        console.log(sql);
        const result = await this.runQuery(sql);
        return result[1];
    }

    async getApprovedAndRevisedExecutions() {
        const sql = `select * from completed_revised_executions order by revised_date desc limit 100;`;
        const result = await this.runQuery(sql);
        return result[0];
    }

    async setApprovedExecution(scrapping_id, completed, revised) {
        const sql = `replace into completed_revised_executions (scraping_id, completed, revised, revised_date) 
        values ("${scrapping_id}", ${completed}, ${revised}, sysdate());
`;
        return await this.runQuery(sql);
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
    async getScrapingExecutionLog(limit, offset, order = "desc") {
        const sql = `set sql_mode ="";
        select t.*, r.date_scraped, r.app_id, r.device_id from scraping_execution_log t, scraping_results r 
        where t.last_piece = r.piece_id
        group by r.date_scraped
        order by r.date_scraped ${order}
        limit ${limit}
        offset ${offset};`;
        try {
            const result = await this.runQuery(sql);
            return result[1];
        } catch (err) {
            console.log(err);
            return null;
        }
    }



}
