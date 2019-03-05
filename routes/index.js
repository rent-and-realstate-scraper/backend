// combine routes
const route2 = require('./route2');
const scrapingResultsProcess = require('./scrapingResultsProcess');
const scrapingActionsWorkers = require ('./scrapingActionsWorkers');
module.exports= (server) => {
  route2(server);
  scrapingActionsWorkers(server);
  scrapingResultsProcess(server);
};
