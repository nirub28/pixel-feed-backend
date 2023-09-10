const mongoose = require("mongoose");  // data base connection

mongoose.connect("mongodb://localhost/pixel-feed");

const db = mongoose.connection;

db.on("error", console.error.bind("Error connecting to MongoDB"));

db.once("open", function () {
  console.log("Conneted to Database:: MongoDB");
});

module.exports = db;