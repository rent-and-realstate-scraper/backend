
const ExtractBoundingBox = require('./ExtractBoundingBoxDB');
//const ScraperDataAccess = require('./ScraperDataAccess');
const ScraperDataAccess = require('./MysqlDataAccessForWorkers');

require('dotenv').load();

module.exports = class ScrapingIndexCreator {
    constructor(citiesPath = '../scripts/config/cities.json', configPath = '../scripts/config/scrapingConfig.json', sqlCreationPath = "./scripts/initialize.sql") {
        this.citiesPath = citiesPath;
        this.configPath = configPath;
        this.config = require(this.configPath);
        this.cities = require(this.citiesPath).cities;
        this.scraper = new ExtractBoundingBox();
        this.db = new ScraperDataAccess();

        this.maxSize = 0.005;
        this.maxNumberRows = 65; // aprox Math.sqrt(1000);
        this.minNumberRows = 4;

    }

    async regenerateScrapingIndex(){
        await Promise.all(this.config.devices.map(async device => await this.regenerateScrapingIndexForDevice(device)))
    }

    async regenerateScrapingIndexForDevice(device) {
        try {
            console.log("removing old data for tables");
            await this.db.dropIndex(device.device_id);
        } catch (err) {
            console.log(err);
        }
        try {
            console.log("creating tables");
            await this.db.createTables();
        } catch (err) {
            console.log(err);
            throw  err;
        }

        if (device.cities) {
            this.cities = device.cities;}
        else {
            this.cities = require(this.citiesPath).cities;
        }
        await this.db.saveRegisteredDevice(device);
        await Promise.all( this.cities.map((city)=>{
            city = city.toLowerCase();
            const cityObj = {city,device_id:device.device_id};
            console.log("registering city ")
            console.log(city);
            return this.db.saveRegisteredCity(cityObj);
        }))

        await Promise.all(this.cities.map(async city => await this.populateIndexForCity(city,device)));

    }

    async populateIndexForCity(cityName, device){
        console.log("initalizing scraping index for " + cityName);
        const boundingBox = await this.scraper.extractBoundingBoxFromCityName(cityName);
        const boxSize = Math.min(parseFloat(-boundingBox[0][0]) + parseFloat(boundingBox[1][0]), parseFloat(boundingBox[0][1]) - parseFloat(boundingBox[1][1]));

        const distX = parseFloat(boundingBox[1][0]) - parseFloat(boundingBox[0][0]);
        const distY = parseFloat(boundingBox[0][1]) - parseFloat(boundingBox[1][1]);

        console.log(boxSize);

        if ((distX) > 0) {
            console.log("generating index and pieces");
            let lengthX = this.calculateNumberRows(distX);
            let lengthY = this.calculateNumberRows(distY);

            const childrenSmallBoxes = this.popullateBoundingBoxWithPieces(boundingBox, distX, distY, lengthX, lengthY);

            for (const pieceName in childrenSmallBoxes) {
                const pieceId = cityName + "--" + pieceName + "--" + device.device_id;
                console.log(pieceId);
                const boundingBox = childrenSmallBoxes[pieceName].boundingBox;
                const centerPoint = this.getCenterPoint(boundingBox);

                const record = {
                    piece_id: pieceId, piece_name: pieceName,
                    city_name: cityName, device_id: device.device_id,
                    scraped: false,
                    bounding_box1_x: boundingBox[0][0], bounding_box1_y: boundingBox[0][1],
                    bounding_box2_x: boundingBox[1][0], bounding_box2_y: boundingBox[1][1],
                    center_point_x: centerPoint[0],
                    center_point_y: centerPoint[1], method: device.method
                }
                await this.db.saveScrapingPiecesIndex(record);
            }
        }
    }


    calculateNumberRows(boxSize) {
        let result = Math.floor(boxSize / this.maxSize)
        // we make sure the number is not too small (must be bigger than minNumberRows)
        result = Math.max(result, this.minNumberRows);

        // we make sure the number is not too big
        result = Math.min(result, this.maxNumberRows);
        return result;
    }
    popullateBoundingBoxWithPieces(boundingBox, distX, distY, lengthX, lengthY) {
        let childrenSmallBoxes = {}

        for (let i = 0; i < lengthX; i++) {
            for (let j = 0; j < lengthY; j++) {

                const newBox00 = parseFloat(boundingBox[0][0]) + (i / lengthX) * distX;
                const newBox01 = parseFloat(boundingBox[0][1]) - (j / lengthY) * distY;
                const newBox10 = newBox00 + (1 / lengthX) * distX;
                const newBox11 = newBox01 - (1 / lengthY) * distY;

                const box = [[newBox00, newBox01], [newBox10, newBox11]]
                const pieceBoxId = "piece--" + i + "-" + j;
                childrenSmallBoxes[pieceBoxId] = {
                    boundingBox: box, centerPoint: this.getCenterPoint(box)
                };
            }
        }
        return childrenSmallBoxes;
    }

    getCenterPoint(boundingBox) {
        return [(boundingBox[0][0] + boundingBox[1][0]) / 2, (boundingBox[0][1] + boundingBox[1][1]) / 2]
    }


}
