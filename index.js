const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 8000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON data
app.use(bodyParser.json());

// Initialize the database connection
const db = require("./config/mongoose.js");

// Parse cookies in the request
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Set up session management for authentication
const session = require("express-session");
const passport = require("passport");

// Import Passport Local Strategy
const passportLocal = require("./config/passport-local-strategy.js");

// Import the MongoStore to store session data in MongoDB
const MongoStore = require("connect-mongo");

// Middleware to parse the request body
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Create a session
app.use(
  session({
    name: "pixelFeed", // Name of the session cookie
    secret: "E1EQr55QqbYbyyTJEboFzVRfRMngtf8E", // Secret used to sign the session ID cookie
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60, /// Session duration in milliseconds (1 hour)
    },
    store: MongoStore.create(
      {
        mongoUrl: "mongodb://127.0.0.1:27017/pixel-feed", // MongoDB connection URL
        touchAfter: 3600
      },
      function (err) {
        console.log(
          "error at mongo store",
          err || "connection established to store cookie"
        );
      }
    ),
  })
);

// Initialize Passport
app.use(passport.initialize());

// Use Passport's session after initializing Passport
app.use(passport.session());

// Add authenticated user information to res.locals
app.use(passport.setAuthenticatedUser);


// Include your routes
app.use("/", require("./routes"));

// Start the server
app.listen(PORT, function (err) {
  if (err) {
    console.log(`The error in running server ${err}`);
  }
  console.log(`The server is running on port: ${PORT}`);
});
