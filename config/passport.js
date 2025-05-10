const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { userNameFiled: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(null, false, {
              message: "that email is not registered",
            });
          }

          const isMatch = await user.matchPassword(password);

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "password incorrect" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
