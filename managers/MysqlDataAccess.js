const fs = require('fs');
const mysql = require('mysql');

module.exports = class MysqlDataAccess {
    constructor(mysqlHost, mysqlUser, mysqlPassword, mysqlDatabase, sqlCreationPath = "../scripts/initalize.sql") {
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
    async createTables() {
        const script = fs.readFileSync(this.tableCreatorScriptPath, 'utf8');
        await this.runQuery(script);
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

    async saveExecutionLog(executionLogRecord) {
        const sql = `REPLACE INTO scraping_execution_log(scraping_id, last_piece, last_result) 
        values("${executionLogRecord.scraping_id}", "${executionLogRecord.last_piece}", "${executionLogRecord.result_id}")`;
        return await this.runQuery(sql);
    }


    async saveScrapingPiecesIndex(scapingPiecesIndexRecord) {
        const sql = `REPLACE INTO scraping_pieces_index 
        (piece_id, piece_name, city_name, device_id, scraped, bounding_box1_x, bounding_box1_y, bounding_box2_x, bounding_box2_y, center_point_x, center_point_y, geojson_coordinates, method) VALUES("${scapingPiecesIndexRecord.piece_id}", "${scapingPiecesIndexRecord.piece_name}", "${scapingPiecesIndexRecord.city_name}","${scapingPiecesIndexRecord.device_id}", ${scapingPiecesIndexRecord.scraped}, ${scapingPiecesIndexRecord.bounding_box1_x},  ${scapingPiecesIndexRecord.bounding_box1_y},  ${scapingPiecesIndexRecord.bounding_box2_x}, ${scapingPiecesIndexRecord.bounding_box2_y}, ${scapingPiecesIndexRecord.center_point_x}, ${scapingPiecesIndexRecord.center_point_y}, "${scapingPiecesIndexRecord.geojson_coordinates}", "${scapingPiecesIndexRecord.method}");`;
        //console.log(sql);
        return await this.runQuery(sql);
    }

    async saveScrapingResults(scapingResultsRecord) {
        const sql = `REPLACE INTO scraping_results(result_id, piece_id, scraping_id, app_id, device_id, date_scraped, average_prize_buy, number_of_ads_buy, average_prize_rent, number_of_ads_rent, extra_data) values( "${scapingResultsRecord.result_id}", "${scapingResultsRecord.piece_id}",  "${scapingResultsRecord.scraping_id}", "${scapingResultsRecord.app_id}", "${scapingResultsRecord.device_id}", sysdate(),${scapingResultsRecord.average_prize_buy}, ${scapingResultsRecord.number_of_ads_buy},${scapingResultsRecord.average_prize_rent}, ${scapingResultsRecord.number_of_ads_rent}, "${scapingResultsRecord.extra_data}");`
        return await this.runQuery(sql);
    }

    async dropIndex(device_id) {
        const sql = `DELETE from scraping_pieces_index WHERE device_id="${device_id}"`;
        //console.log(sql);
        return await this.runQuery(sql);
    }


    async getGeographicDataMunicipio(cityName){
        const sql = `select ROUND(LONGITUD_ETRS89,5) as longitud, ROUND(LATITUD_ETRS89,5) as latitud, ROUND(PERIMETRO,5) as perimetro from GEOMETRY_MUNICIPIOS
        where NOMBRE_ACTUAL = "${cityName}"`;
        const result = await this.runQuery(sql);
        return result[0];
    }

    async getNextPieceToScrap(device_id) {
        const sql = `select * from scraping_pieces_index where scraped = false and device_id = "${device_id}" order by piece_id asc limit 1;`;
        const result = await this.runQuery(sql);
        return result[0];
    }
    async setIndexAsNotScraped(device_id) {
        const sql = `update scraping_pieces_index set scraped = false where device_id = "${device_id}";`;
        return await this.runQuery(sql);
    }

    async setIndexPieceAsScraped(piece_id) {
        const sql = `update scraping_pieces_index set scraped = true where piece_id = ?;COMMIT;`;
        return await this.runQueryWithInput(sql, [piece_id]);
    }

    async countIndexEntries(device_id) {
        const sql = `select count(*) from scraping_pieces_index where device_id="${device_id}"`;
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

    async updateGeoJsonField(geojson_coordinates, piece_id) {
        const sql = `update scraping_pieces_index set geojson_coordinates="${geojson_coordinates}", method="cusec" where piece_id = "${piece_id}"`;
        const result = await this.runQuery(sql);
        return result;
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
