const ScrapingIndexCreator = require('./ScrapingIndexCreatorBoundingBox');

const creator = new ScrapingIndexCreator('./config/cities.json', "./config/scrapingConfig.json", "./initialize.sql");

(async () => {
    await creator.regenerateScrapingIndex();
    process.exit();
})();
