

module.exports = class GeoJsonGeneratorFromBoundingBox {
    constructor() {
        this.maxOpacity = 0.8;
    }

    generateGeoJsonFromResult(scrapingCityResult) {
        const result = { type: "FeatureCollection", features: [] };
        for (const resultScraping of scrapingCityResult) {
            const boundingBox = this.getBoundingBox(resultScraping)

            const feature = this.generateFeature(boundingBox, resultScraping);
            result.features.push(feature);
        }
        return result;
    }

    getBoundingBox(result) {
        return [[result.bounding_box1_x, result.bounding_box1_y], [result.bounding_box2_x, result.bounding_box2_y]]
    }

    //modeoutpu can be "buy-prize" "buy-ads" "rent-prize" or "rent-ads", first param is buy/rent second if we want to display
    // number of ads or average prize. This will set the stiles of the geojson
    generateFeature(boundingBox, result) {
        const feature = {
            type: "Feature", properties: {}, bbox: [], geometry: {
                type: "Polygon", coordinates: []
            }
        };

        if (result) {
            feature.properties = {
                name: result.piece_id,
                number_of_ads_buy: result.number_of_ads_buy,
                average_prize_buy: result.average_prize_buy,
                number_of_ads_rent: result.number_of_ads_rent,
                average_prize_rent: result.average_prize_rent,
                date: result.date_scraped
            };

        }

        const bbox = [boundingBox[1][0], boundingBox[1][1], boundingBox[0][0], boundingBox[0][1]];
        const coordinates = [[[bbox[0], bbox[3]], [bbox[2], bbox[3]], [bbox[2], bbox[1]], [bbox[0], bbox[1]], [bbox[0], bbox[3]]]]

        feature.bbox = bbox;
        feature.geometry.coordinates = coordinates;
        return feature;
    }
    }
