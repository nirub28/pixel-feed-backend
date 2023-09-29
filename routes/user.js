const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/user_controller");
const jwt = require("jsonwebtoken");

const multer = require('multer');
const upload = multer(); // Initialize multer



router.get("/check-username", userController.isUsernameAvailable);
router.post("/signup", userController.signup);

router.post("/signin", passport.authenticate("local"), (req, res) => {
  const user = req.user;


  // Generate a JWT token
  const tokenToSend = jwt.sign({ userId: user.id }, "pixelniru", { expiresIn: "1h" });


  // Create a user object with only the desired properties
  const userToSend = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    profilePictureToShow:user.profilepic,
    bio: user.bio,
    followers:user.followers,
    following:user.following,
    token:tokenToSend,
  };

  // Send the response with user, session, and token
  res.status(200).json({
    message: "Login successful",
    user: userToSend,
  });
});


router.get("/logout", userController.destroySession);


router.post('/follow/:userId', userController.followUser);
router.get('/profile/:userid', userController.getUserProfileByUsername);


router.get('/checkIfFollowing', userController.checkIsFollowing);
router.post('/unfollow/:userId',  userController.unFollowing);

router.get('/followers/:userId', userController.getFollowers);
router.get('/following/:userId', userController.getFollowing);

router.put('/update-profile/:userId', upload.single('profilePicture'), userController.updateUserProfile);

router.get('/search', userController.seachUsers );


module.exports = router;
