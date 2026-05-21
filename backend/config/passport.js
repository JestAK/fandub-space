const dotenv = require('dotenv');
dotenv.config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const name = profile.displayName;

            let user = await User.findOne({ where: { email } });

            const generatedPassword = Math.random().toString(36).slice(-8);

            if (!user) {
                user = await User.create({
                    email: email,
                    name: name,
                    role: 'actor',
                    password: generatedPassword,
                    isAdmin: false
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

module.exports = passport;