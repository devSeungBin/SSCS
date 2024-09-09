const passport = require('passport');
const local = require('./localStrategy');
const google = require('./googleStrategy');

const db = require('../models/index.db');
const { Users } = db;

module.exports = () => {
    passport.serializeUser((user, done) => {
        //user = user.dataValues;
        done(null, user.id);
    });

    passport.deserializeUser( async (id, done) => {
        await Users.findOne({ where: { id: id } })
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