const express = require('express');

// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require ('dotenv'); // env variables
dotenv.config();


const app = express();
const PORT = 8000;


// Initialize the database connection
const db = require("./config/mongoose.js");

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');



//set up chat server to be used with socket.io
const chatServer = require('http').Server(app);
const chatSockets= require('./config/chat_socket.js').chatSockets(chatServer);
chatServer.listen(5000);
console.log('Chat server is running on port 5000');


// const bucketName = process.env.BUCKET_NAME
// const bucketRegion = process.env.BUCKET_REGION
// const accessKey = process.env.ACCESS_KEY
// const secretAccessKey = process.env.SECRET_ACCESS_KEY

// const s3 = new S3Client({
//   credentials:{
//     accessKeyId: accessKey,
//     secretAccessKey: secretAccessKey,
//   },
//   region:bucketRegion,
// })

// Enable Cross-Origin Resource Sharing (CORS)

// Parse incoming JSON data
app.use(bodyParser.json());





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





