const MysqlDataAccess = require("../managers/MysqlDataAccess");
const GeoJsonGeneratorFromBoundingBox = require("../managers/GeoJsonGeneratorFromBoundingBox");
const get = require('lodash').get;
const geoJsonGeneratorBoundingBox = new GeoJsonGeneratorFromBoundingBox();

require('dotenv').load();

const db = new MysqlDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);


const routes= (server) => {
    server.get('/api/scraping_results/geojson', async (req, res, next) => {
        const city = get(req.query, 'city');
        const scrapingId = get(req.query, 'scraping_id');
        const result = await db.getScrapingResultsCity(city, scrapingId);
        console.log(result);
        let geoJson = geoJsonGeneratorBoundingBox.generateGeoJsonFromResult(result);
        res.send(geoJson);
        return next();
    });
    
    server.get('/api/scraping_results/results', async (req, res, next) => {
        const city = get(req.query, 'city');
        const scrapingId = get(req.query, 'scraping_id');
        const result = await db.getScrapingResultsCity(city, scrapingId);
        res.send(result);
        return next();
    });

    server.get('/api/scraping_results/scraped_cities', async (req, res, next) => {
        const scrapingId = get(req.query, 'scraping_id');
        const result = await db.getScrapedCities(scrapingId);
        res.send(result);
        return next();
    });

    server.get('/api/scraping_results/process_info', async (req, res, next) => {
        const scrapingId = get(req.query, 'scraping_id');
        const deviceId = get(req.query, 'device_id');
        const scrapedNum = await db.getScrapedCount(deviceId, true);
        const scrapedRemaning = await db.getScrapedCount(deviceId, false);
        const lastPiece = await db.getLastPiece(scrapingId);
        const result = {};
        result["scraped_pieces"] = scrapedNum;
        result["scraped_remaining"] = scrapedRemaning;
        result["scraped_pieces_percent"] = scrapedNum / (scrapedNum + scrapedRemaning) * 100;
        result["last_piece"] = get(lastPiece[0],"scraping_id");
        res.send(result);
        return next();
    });

    server.get('/api/scraping_results/scraping_remaining', async (req, res, next) => {
        const scrapingId = get(req.query, 'scraping_id');
        const deviceId = get(req.query, 'device_id');
        const result = {};
        const scrapedNum = await db.getScrapedCount(deviceId, true);
        const scrapedRemaning = await db.getScrapedCount(deviceId, false);
        result["scraped_pieces"] = scrapedNum;
        result["scraped_remaining"] = scrapedRemaning;
        result["scraped_pieces_percent"] = scrapedNum / (scrapedNum + scrapedRemaning) * 100;
        res.send(result);
        return next();
    });

    server.get('/api/scraping_results/scraping_remaining_all_devices', async (req, res, next) => {
        const result = {};
        const listDevices = await db.listDevices();
        for (let device_id of listDevices) {
            device_id = device_id.device_id;
            result[device_id] = {};
            const scrapedNum = await db.getScrapedCount(device_id, true);
            const scrapedRemaning = await db.getScrapedCount(device_id, false);
            result[device_id]["scraped_pieces"] = scrapedNum;
            result[device_id]["scraped_remaining"] = scrapedRemaning;
            result[device_id]["scraped_pieces_percent"] = scrapedNum / (scrapedNum + scrapedRemaning) * 100;
        }
        res.send(result);
        return next();
    });

};

module.exports = routes;