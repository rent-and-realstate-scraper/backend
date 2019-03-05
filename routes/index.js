// combine routes
const route2 = require('./route2');
const scrapingResultsProcess = require('./scrapingResultsProcess');
module.exports= (server) => {
  route2(server);
  scrapingResultsProcess(server);
};
