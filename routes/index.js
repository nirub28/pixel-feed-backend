const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home_controller");


router.get("/", homeController.home);
router.use("/user", require("./user"));
router.use("/post", require("./post"));
router.use("/message", require("./message"));




module.exports = router;