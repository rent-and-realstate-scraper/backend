const ScrapingIndexCreator = require('../managers/ScrapingIndexCreatorBoundingBox');

const creator = new ScrapingIndexCreator();

(async () => {
    await creator.regenerateScrapingIndex();
    process.exit();
})();
