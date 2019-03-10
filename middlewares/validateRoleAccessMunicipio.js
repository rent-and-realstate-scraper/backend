const passport = require('passport');
const get = require('lodash').get;
var User = require("../models/User");

require('../config/passport')(passport);

module.exports = (req, res, next) => {
    //if (process.env['USE_AUTH']) passport.authenticate('jwt', { session: false })(req, res, next);
    console.log("validating role access");
    let cityName = get(req, "query.cityName");

    if (process.env['USE_AUTH'] === 'true') {
        passport.authenticate('jwt', function (err, user) {
            if (user) {
                console.log(user);
                console.log(user.role);
                console.log(cityName);
                if (user.role == cityName || user.role == "ALL" || user.role == "ADMIN"){
                    console.log("access granted")
                } else {
                    return res.send({error:"no autorizado para este municipio"})
                }
            }
        })(req, res, next);

    }
    next();
}
