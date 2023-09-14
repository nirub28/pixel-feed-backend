const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Connect to strategy and allow authentication with email or username
passport.use(
  new LocalStrategy(
    {
      usernameField: "usernameOrEmail",
      passwordField: "password",
    },
    async function (usernameOrEmail, password, done) {
      try {
        const user = await User.findOne({
          $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        });

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!user || !isPasswordValid) {
          return done(null, false, {
            message: "Invalid Username/Password",
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err, false, {
          message: "Internal server error",
        });
      }
    }
  )
);

// Serialize user by id
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      if (!user) {
        console.log("User not found");
        return done(null, false);
      }
      return done(null, user);
    })
    .catch((err) => {
      console.log("Error in deserializing user:", err);
      return done(err);
    });
});

// Check if user is authenticated
passport.checkAuthentication = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" }); // Send a JSON response for unauthorized users
};

// Add the authenticated user to res.locals
passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
