const passport = require('passport');
const config = require('../config/database');
require('../config/passport')(passport);
const jwt = require('jsonwebtoken');
const User = require("../models/User");

const routes= (server) => {
    server.post('/api/security/signup', (req, res, next) => {
        if (!req.body.username || !req.body.password) {
            res.send({ success: false, msg: 'Please pass username and password.' });
            return next();
        } else {
            var newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            // save the user
            newUser.save(function (err) {
                if (err) {
                    res.send({ success: false, msg: 'Username already exists.' });
                    return next();
                }
                res.send({ success: true, msg: 'Successful created new user.' });
                console.log('Successful created new user.' + newUser.username)
                return next();
            });
        }
    });

    server.post('/api/security/login', (req, res, next) => {
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.status(401);
                res.send({ success: false, msg: 'Authentication failed. User not found.' });
                return next();
            } else {
                // check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right create a token
                        var token = jwt.sign(user.toJSON(), config.secret);
                        // return the information including token as JSON
                        res.send({ success: true, token: 'JWT ' + token, role:user.role });
                        return next();
                    } else {
                        res.status(401);
                        res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                        return next();
                    }
                });
            }
        });
    });

    server.get('/api/security/is_logged_in',  (req, res, next, err) => {
        if(err){
            console.log(err);
        }
        passport.authenticate('jwt', function (err, user) {
            if (user) {
                res.send({logged:true, message:"ok", userLogged:{username:user.username, role:user.role}});
            } else {
                res.send({logged:false, message:"unauthorized"});
            }
        })(req,res);
        return next();
    });

    getToken = function (headers) {
        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };
};

module.exports = routes;
