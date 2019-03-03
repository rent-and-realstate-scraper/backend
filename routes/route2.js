const routes= (server) => {
  server.get('/route2', (req, res, next) => {
      const param1 = req.query.param1;
      res.send({message:'Hello from route 2. you introduced ' + param1});
      return next();
    });

  server.post('/route2Post', (req, res, next) => {
    const body = req.params;
    res.send({message:'Hello from route 2 post. you introduced ' + body.param1});
    return next();
  });
};

module.exports = routes;
