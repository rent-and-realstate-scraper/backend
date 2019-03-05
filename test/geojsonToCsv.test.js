const chai = require('chai');
const assert = chai.assert;
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost(0.01));

const GeojsonToCsvParserBoundingBox = require('../utils/GeojsonToCsvParserBoundingBox');
const converter = new GeojsonToCsvParserBoundingBox();

const expect = chai.expect;

describe('Utils', function () {
    before(function() {
        this.skip();
    });
    describe('check that the helper converts gejson to csv', async function () {
        it('shoud be not null and should contain data', function () {
            const csv = converter.obtainCsvFromGeojson();
            expect(csv).not.undefined;
            expect(csv[0].bounding_box1_x).not.undefined
        });
    });
});
