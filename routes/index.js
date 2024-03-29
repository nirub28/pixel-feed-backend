const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home_controller");


router.get("/", homeController.home);
router.use("/user", require("./user"));
router.use("/post", require("./post"));
router.use("/message", require("./message"));
router.use("/notification", require("./notification"));
router.use("/bluetick", require("./bluetick"));






module.exports = router;