const convert = require('xml-js');
const axios = require('axios');
const ScraperDataAccess = require('./MysqlDataAccess');

module.exports = class ExtractBoundingBox {
    constructor() {
        this.db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"],
            process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
    }

    async extractBoundingBoxFromCityName(cityname) {
        try{
            const geoData = await this.db.getGeographicDataMunicipio(cityname);
            const longitude = geoData["longitud"];
            const latitude = geoData["latitud"];
            const perimeterLat = this.convertKilometersIntoLatitudeDegrees(geoData["perimetro"]);
            const perimeterLon = this.convertKilometersIntoLongitudeDegrees(geoData["perimetro"],longitude);

            const result =  [[longitude - perimeterLon/2, latitude + perimeterLat/2], [longitude + perimeterLon/2, latitude - perimeterLat/2]];
            return result;
        } catch (e) {
            console.log(e);
            return undefined
        }

    }

    // check https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-km-distance
    convertKilometersIntoLatitudeDegrees(m){
        return m * 0.16/ 110000;
    }

    convertKilometersIntoLongitudeDegrees(m, longitude){
        const cos = Math.abs(Math.cos(longitude));
        return m * 0.3 / (111000);
    }

}
