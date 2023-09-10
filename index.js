const express = require('express');
const fs = require('fs').promises;
const bodyParser = require('body-parser'); 
const cors = require('cors');
const app = express();

const PORT = 8000;

app.use(cors());
app.use(bodyParser.json()); 

const db = require("./config/mongoose.js");
// app.use(express.urlencoded({ extended: false }));



//authentication
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-stratergy");
const MongoStore = require("connect-mongo"); // to store session data in mongodb

//create session
app.use(
    session({
      name: "cdnPlacement",
      secret: "E1EQr55QqbYbyyTJEboFzVRfRMngtf0E",
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 100,
      },
  
      store: new MongoStore(
        {
          mongoUrl: "mongodb+srv://nirub:nirub283@cluster0.ye8q8b0.mongodb.net/cdn?retryWrites=true&w=majority",
          autoremove: "disabled",
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
    
    //authentication
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.SetAuthenticatedUser);



app.use("/", require("./routes"));
      


app.listen(PORT, function (err) {
    if (err) {
      console.log(`The error in runng server ${err}`);
    }
    console.log(`The server is running on port: ${PORT}`);
  });