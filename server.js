const restify = require('restify');
const routes = require("./routes");
const morgan  = require('morgan');
require('dotenv').load();
const corsMiddleware = require('restify-cors-middleware')

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
})

const server = restify.createServer({ name: 'api' });

server.pre(cors.preflight)
server.use(cors.actual)
server.use(morgan('combined'));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
        mapParams: true
    }));
server.use(restify.plugins.acceptParser(server.acceptable));

routes(server);

server.listen(3000);

// export for testing
module.exports = server;