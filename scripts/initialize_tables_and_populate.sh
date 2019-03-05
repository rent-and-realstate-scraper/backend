echo "creating tables for geographical data";
node initializeAndPopulateTablesGeometryMunicipioIGE.js ;

echo "creating tables for scraping index";
node initializeAndPopulateScrapingIndex.js ;

