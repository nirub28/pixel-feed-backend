const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/user_controller");

router.get("/check-username/:username", userController.isUsernameAvailable);
router.post('/signup', userController.signup);


module.exports = router;