const passport = require('passport');
const get = require('lodash').get;
var User = require("../models/User");

require('../config/passport')(passport);

module.exports = (req, res, next) => {
    //if (process.env['USE_AUTH']) passport.authenticate('jwt', { session: false })(req, res, next);
    console.log("validating role access");

    if (process.env['USE_AUTH'] === 'true') {
        passport.authenticate('jwt', function (err, user) {
            if (user) {
                if (user.role == "ADMIN"){
                    console.log("access granted")
                } else {
                    console.log("access denied");
                    return res.status(401).send({error:"no autorizado para admin"})
                }
            }
        })(req, res, next);

    }
    next();
}
