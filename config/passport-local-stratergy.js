const passport = require("passport");
//connecting to stratergy in passport .local
const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/User");

//connect to startergy and make user name as email and validate passoword
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true, // to pass the flash msg request
    },
    async function (req, email, password, done) {
      // req taken to pass flash msg
      const user = await User.findOne({ email: email });

      if (!user || user.password != password) {
        req.flash("error", "Invalid Username/Password");
        return done(null, false);
      }
      return done(null, user);
    }
  )
);

// only the id property of the user object will be serialized and stored in the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//Deserialize user
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

//to check user aythenticated or not
passport.checkAuthentication = function (req, res, next) {
  //if yes then move to next excecution
  if (req.isAuthenticated()) {
    return next();
  }

  // else return to sign-in
  return res.redirect("/users/sign-in");
};

//req.user has current signed user, so we need to give this user views access
passport.SetAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;