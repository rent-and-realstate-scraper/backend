const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('App', () => {
    //this.timeout(15000);

    describe('/api/scraping_results/results', () => {
        it('responds with status 200 and is a geojson', function (done) {
            chai.request(server)
                .get('/api/scraping_results/results?city=Medinaceli&scraping_id=scraping-new-test7')
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.geojson.features).not.undefined;
                    expect(res.body.intervals).not.undefined;
                    done();
                });
        });
    });
    describe('/api/scraping_results_approved/results', () => {
        it('responds with status 200 and is a geojson', function (done) {
            chai.request(server)
                .get('/api/scraping_results_approved/results?city=Medinaceli&app_id=airbnb&method=boundingBox')
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.geojson.features).not.undefined;
                    expect(res.body.intervals).not.undefined;
                    done();
                });
        });
    });
    describe('/api/scraping_results/scraped_cities', () => {
        it('responds with status 200', function (done) {
            chai.request(server)
                .get('/api/scraping_results/scraped_cities?scraping_id=scraping-airbnb-raspberryOld--3_8_2019,_2_16_40_AM')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('/api/scraping_results/process_info', () => {
        it('responds with status 200 and contains data', function (done) {
            chai.request(server)
                .get('/api/scraping_results/process_info?device_id=test_device&scraping_id=scraping-airbnb-raspberryOld--3_8_2019,_2_16_40_AM')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res.body.scraped_pieces).not.undefined;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('/api/scraping_results/scraping_remaining', () => {
        it('responds with status 200 and contains data', function (done) {
            chai.request(server)
                .get('/api/scraping_results/scraping_remaining?device_id=test_device&scraping_id=scraping-airbnb-raspberryOld--3_8_2019,_2_16_40_AM')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res.body.scraped_pieces).not.undefined;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('/api/scraping_results/scraping_remaining_all_devices', () => {
        it('responds with status 200 and contains data', function (done) {
            chai.request(server)
                .get('/api/scraping_results/scraping_remaining_all_devices')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
