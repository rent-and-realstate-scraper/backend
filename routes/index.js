// combine routes
const route1 = require('./route1');
const route2 = require('./route2');

module.exports= (server) => {
  route1(server);
  route2(server);
};