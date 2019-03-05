
USE scraping;

DROP TABLE IF EXISTS GEOMETRY_MUNICIPIOS_OPENDATASOFT;

create table if not exists GEOMETRY_MUNICIPIOS_OPENDATASOFT(
municipio              TEXT,
provincia              TEXT,
bounding_box1_x        TEXT,
bounding_box1_y        TEXT,
bounding_box2_x        TEXT,
bounding_box2_y        TEXT);

LOAD DATA LOCAL INFILE 'data/opensoft-espana-municipios-processed.csv'
INTO TABLE GEOMETRY_MUNICIPIOS_OPENDATASOFT
CHARACTER SET 'utf8'
COLUMNS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\n';

