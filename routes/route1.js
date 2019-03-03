module.exports = (server) => {
    server.get('/route1', (req, res, next) => {
      res.send({message:'Hello from route 1'});
      return next();
    });
};