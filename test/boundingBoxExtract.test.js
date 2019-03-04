const chai = require('chai');
const ExtractBoundingBox = require('../scripts/ExtractBoundingBoxDB');
const assert = chai.assert;
const cities = require("../scripts/config/cities.json").cities;
const expect = chai.expect;
require('dotenv').load()
describe('App', async function () {
    this.timeout(15000);

    describe('test that ExtractBoundingBoxScraper scraps data from Móstoles and Madrid', async function () {
        const scraper = new ExtractBoundingBox();
        console.log(cities);

        for (const city of cities) {
            console.log(city);
            try{
                const result = await scraper.extractBoundingBoxFromCityName(city);
                console.log(result);
                assert(result !== null);
            } catch (e) {
                console.log(e)
                assert(false===true);
            }

        }
    });

});
