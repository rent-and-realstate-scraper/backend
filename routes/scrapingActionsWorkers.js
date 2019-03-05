const MysqlDataAccess = require("../managers/MysqlDataAccess");
const get = require('lodash').get;
require('dotenv').load();
const db = new MysqlDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
const ScrapingIndexCreatorBoundingBox = require('../managers/ScrapingIndexCreatorBoundingBox');

const indexCreator = new ScrapingIndexCreatorBoundingBox();

const routes= (server) => {
    server.put('/api/workers/execution_log', async (req, res, next) => {
        const body = req.params;
        try {
            await db.saveExecutionLog(body);
            res.send({message:"execution log updated"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e})
            next();
        }
    });

    server.put('/api/workers/scraping_piece_index', async (req, res, next) => {
        const body = req.params;
        try {
            await db.saveScrapingPiecesIndex(body);
            res.send({message:"scraping piece updated in index"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.put('/api/workers/scraping_results', async (req, res, next) => {
        const body = req.params;
        try {
            await db.saveScrapingResults(body);
            res.send({message:"scraping piece updated in index"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.del('/api/workers/drop_index', async (req, res, next) => {
        const deviceId = get(req.query, 'device_id');
        try {
            await db.dropIndex(deviceId);
            res.send({message:"index dropped"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.del('/api/workers/regenerate_scraping_index', async (req, res, next) => {
        const deviceId = get(req.query, 'device_id');
        try {
            console.log(deviceId);
            const device = {deviceId, method:"boundingBox"};
            await indexCreator.regenerateScrapingIndexForDevice(device);
            res.send({message:"scraping_index_regenerated"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.del('/api/workers/set_index_as_not_scraped', async (req, res, next) => {
        const deviceId = get(req.query, 'device_id');
        try {
            await db.setIndexAsNotScraped(deviceId);
            res.send({message:"index dropped"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.del('/api/workers/set_index_piece_as_scraped', async (req, res, next) => {
        const pieceId = get(req.query, 'piece_id');
        try {
            await db.setIndexPieceAsScraped(pieceId);
            res.send({message:"index piece updated"});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.get('/api/workers/next_piece_to_scrap', async (req, res, next) => {
        const deviceId = get(req.query, 'device_id');
        try {
            const result = await db.getNextPieceToScrap(deviceId);
            console.log(result);
            res.send(result);
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });

    server.get('/api/workers/count_index_pieces', async (req, res, next) => {
        const deviceId = get(req.query, 'device_id');
        try {
            const result = await db.countIndexEntries(deviceId);
            console.log(result);
            res.send({count:result});
            next();
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send({error:e});
            next();
        }
    });



};

module.exports = routes;
