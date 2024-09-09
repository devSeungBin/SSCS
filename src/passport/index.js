const passport = require('passport');
const local = require('./localStrategy');
const google = require('./googleStrategy');

const db = require('../models/index.db');
const { User } = db;

module.exports = () => {
    passport.serializeUser((user, done) => {
        //user = user.dataValues;
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ where: { id: id } })
            .then((user) => {
                //user = user.dataValues;
                done(null, user);
            })
            .catch((err) => {
                done(err);
            });
    });

    local();
    google();
};