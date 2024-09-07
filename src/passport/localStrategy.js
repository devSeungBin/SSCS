const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../models/index.db');
const { User } = db;

module.exports = () => {
    passport.use(
        new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ where: { email: email } });
                if (user) {
                    if (password === user.password) {
                        done(null, user);
                    } else {
                        done(null, false, { message: '아이디 또는 비밀번호가 일치하지 않음' });
                    }
                } else {
                    done(null, false, { message: '아이디 또는 비밀번호가 일치하지 않음' });
                }

            } catch (err) {
                done(err);
            }
        },
        ),
    );
};