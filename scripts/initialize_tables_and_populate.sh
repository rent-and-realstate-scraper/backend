echo "creating tables for geographical data";
node initializeAndPopulateTablesGeometryMunicipio.js ;

echo "creating tables for scraping index";
node initializeAndPopulateScrapingIndex.js ;

