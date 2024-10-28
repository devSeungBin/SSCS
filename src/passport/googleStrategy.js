const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { RandomImageGenerator } = require('../util/util.js');
const db = require('../models/index.db');
const { Users, Preferences } = db;

const keys = require('../config/keys.config');


module.exports = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: keys.GOOGLE_CLIENT_ID, 
                clientSecret: keys.GOOGLE_CLIENT_SECRET, 
                callbackURL: keys.GOOGLE_LOGIN_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                profile = profile._json;
                try {
                    const user = await Users.findOne({ where: { email: profile.email } });
                    if (user) {
                        done(null, user, { statusCode: 200, user: user.toJSON() });
                    } else {
                        const randomImage = new RandomImageGenerator().getRandomImage();
                        const newUser = await Users.create({
                            name: profile.name,
                            email: profile.email,
                            image: randomImage,
                            provider: 'google',
                            access_token: accessToken,
                            calendar_id: profile.email,
                        });

                        done(null, newUser, { statusCode: 201, user: newUser.toJSON() }); 
                    };
                } catch (err) {
                    done(err, null, { statusCode: 500 });
                };
            },
        ),
    );
};
