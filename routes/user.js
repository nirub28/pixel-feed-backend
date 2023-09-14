const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/user_controller");
const jwt = require("jsonwebtoken");

router.get("/check-username", userController.isUsernameAvailable);
router.post("/signup", userController.signup);

router.post("/signin", passport.authenticate("local"), (req, res) => {
  const user = req.user;

  // Create a user object with only the desired properties
  const userToSend = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
  };

  // Generate a JWT token
  const token = jwt.sign({ userId: user.id }, "pixelniru", { expiresIn: "1h" });

  // Send the response with user, session, and token
  res.status(200).json({
    message: "Login successful",
    user: userToSend,
    session: req.session,
    token: token,
  });
});


router.get("/logout", userController.destroySession);

module.exports = router;
