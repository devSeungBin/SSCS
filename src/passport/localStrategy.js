const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../models/index.db');
const { Users } = db;

module.exports = () => {
    passport.use(
        new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await Users.findOne({ where: { email: email } });
                if (user) {
                    if (password === user.password) {
                        done(null, user, { statusCode: 200 });
                    } else {
                        done(null, false, { statusCode: 400, comment: '비밀번호가 일치하지 않습니다.' });
                    }
                } else {
                    done(null, false, { statusCode: 404, comment: '해당 이메일을 사용하는 사용자가 없습니다.' });
                }

            } catch (err) {
                done(err, null, { statusCode: 500 });
            }
        },
        ),
    );
};