const fs = require('fs');
const MysqlDataAccess = require("./MysqlDataAccess");
module.exports = class MysqlDataAccessForWorkers extends MysqlDataAccess{
    constructor(mysqlHost , mysqlUser, mysqlPassword , mysqlDatabase) {
        super(mysqlHost,mysqlUser,mysqlPassword,mysqlDatabase);
    }
    async createTables() {
        await this.runQuery(this.script);
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

    async saveRegisteredDevice(device) {
        const sql = `
        REPLACE INTO devices_registry (device_id, date_updated, app_id, method) values ("${device.device_id}", sysdate(), "${device.app_id}", "${device.method}");
        `;
        return await this.runQuery(sql);
    }
    async saveRegisteredCity(city) {
        const sql = `
        REPLACE INTO cities_registry (device_id, city) values ("${city.device_id}", "${city.city}");
        `;
        return await this.runQuery(sql);
    }

    async dropIndex(device_id) {
        const sql = `DELETE from scraping_pieces_index WHERE device_id="${device_id}"`;
        //console.log(sql);
        return await this.runQuery(sql);
    }


    async getGeographicDataMunicipioIGN(cityName){
        const sql = `select ROUND(LONGITUD_ETRS89,5) as longitud, ROUND(LATITUD_ETRS89,5) as latitud, ROUND(PERIMETRO,5) as perimetro from GEOMETRY_MUNICIPIOS_IGN
        where NOMBRE_ACTUAL = "${cityName}"`;
        const result = await this.runQuery(sql);
        return result[0];
    }

    async getGeographicDataMunicipio(cityName){
        const sql = `select * from GEOMETRY_MUNICIPIOS_OPENDATASOFT
        where municipio = "${cityName}"`;
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
            return result[0]["count(*)"];
        } catch (err) {
            console.log(err);
            return null;
        }

    }

    async updateGeoJsonField(geojson_coordinates, piece_id, method ="cusec") {
        const sql = `update scraping_pieces_index set geojson_coordinates="${geojson_coordinates}", method="${method}" where piece_id = "${piece_id}"`;
        const result = await this.runQuery(sql);
        return result;
    }

}
