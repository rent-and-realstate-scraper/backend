const jsonexport = require('jsonexport');
const fs = require('fs');

module.exports = class GeojsonToCsvParserBoundingBox {
    constructor(){
        this.geojsonFile = require('../scripts/data/opensoft-espana-municipios.geojson.json');
        this.csvPath = 'opensoft-espana-municipios-processed.csv';
    }

    obtainCsvFromGeojson(){
        const outputObjArray =[];
        for (const feature of this.geojsonFile.features){
            const municipio = feature.properties["municipio"];
            const provincia = feature.properties["provincia"];
            const boundingBox = this.getBoundingBox(feature.geometry.coordinates,feature.geometry.type);
            if (boundingBox){
                const bounding_box1_x = boundingBox[0][0];
                const bounding_box1_y = boundingBox[0][1];
                const bounding_box2_x = boundingBox[1][0];
                const bounding_box2_y = boundingBox[1][1];

                const record = {municipio, provincia, bounding_box1_x, bounding_box1_y, bounding_box2_x, bounding_box2_y};
                console.log(record);
                outputObjArray.push(record);
            }

        }
        this.generateCsv(outputObjArray);

        return outputObjArray;
    }

    generateCsv(object){
        const csvPath = this.csvPath;
        jsonexport(object, function (err, csv) {
            if (err) return console.log(err);
            console.log("creating " + csvPath);
            fs.writeFile(csvPath, csv);
        });
    }


    getBoundingBox(coordinates, type) {
        let maxX = -180;
        let maxY = -180;
        let minX = 180;
        let minY = 180;
        let coordinatesArr;

        if (type === "MultiPolygon") {
            coordinatesArr = coordinates[0][0];
        } else if (type === "Polygon"){
            coordinatesArr = coordinates[0];
        }

        if (coordinatesArr) {
            for (const point of coordinatesArr) {
                maxX = Math.max(point[0], maxX);
                maxY = Math.max(point[1], maxY);
                minX = Math.min(point[0], minX);
                minY = Math.min(point[1], minY);
            }
            return [[minX, maxY], [maxX, minY]];
        }

    }
    getCenterPoint(boundingBox) {
        return [(boundingBox[0][0] + boundingBox[1][0]) / 2, (boundingBox[0][1] + boundingBox[1][1]) / 2]
    }
}
