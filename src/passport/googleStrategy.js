const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
                        done(null, user);
                    } else {
                        const newUser = await Users.create({
                            name: profile.name,
                            email: profile.email,
                            image: profile.picture,
                            provider: 'google',
                        });

                        await Preferences.create({ user_id: newUser.id });

                        done(null, newUser); 
                    }
                } catch (err) {
                    done(err);
                }
            },
        ),
    );
};
