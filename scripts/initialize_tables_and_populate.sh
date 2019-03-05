cd scripts;

echo "creating tables for geodata";
node initializeAndPopulateTablesGeometryMunicipioOpendatasoft.js;

echo "creating tables for scraping index";
node initializeAndPopulateScrapingIndex.js ;

