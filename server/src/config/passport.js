import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { env } from './env.js';

export function configurePassport() {
  if (!env.googleClientId || !env.googleClientSecret) {
    return;
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user && profile.emails?.[0]?.value) {
            user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
          }

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0]?.value?.toLowerCase(),
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isEmailVerified: true
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            user.isEmailVerified = true;
            await user.save();
          } else if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}
