echo "creating tables for geodata";
node scripts/initializeAndPopulateTablesGeometryMunicipioOpendatasoft.js;

echo "creating tables for scraping index";
node scripts/initializeAndPopulateScrapingIndex.js ;

