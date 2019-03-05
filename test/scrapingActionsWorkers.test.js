const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('App', () => {

    describe('/api/workers/count_index_pieces', () => {
        it('responds with status 200 and contains data', function (done) {
            chai.request(server)
                .get('/api/workers/count_index_pieces?device_id=raspberryOld')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res.body).not.undefined;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

});
