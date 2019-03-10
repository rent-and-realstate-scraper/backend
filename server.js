const restify = require('restify');
const routes = require("./routes");
const morgan  = require('morgan');
const mongoose = require('mongoose');

require('dotenv').load();
const corsMiddleware = require('restify-cors-middleware')

const cors = corsMiddleware({
    origins: ["http://localhost:3001"],
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
});

const server = restify.createServer({ name: 'api' });

server.pre(cors.preflight)
server.use(cors.actual)

server.use(morgan('combined'));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
        mapParams: true
    }));
server.use(restify.plugins.acceptParser(server.acceptable));


mongoUrl = process.env['MONGODB_URL']
mongoose.connect(mongoUrl, { promiseLibrary: require('bluebird') })
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

routes(server);

server.listen(3000);

// export for testing
module.exports = server;