const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/user_controller");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const multer = require("multer");
const upload = multer(); // Initialize multer

const cryto = require("crypto");
const { Upload } = require("@aws-sdk/lib-storage");

const randomImageName = (bytes = 32) =>
  cryto.randomBytes(bytes).toString("hex"); // to create a random name

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

router.get("/check-username", userController.isUsernameAvailable);
router.post("/signup", userController.signup);

router.post("/signin", passport.authenticate("local"), (req, res) => {
  const user = req.user;

  // Generate a JWT token
  const tokenToSend = jwt.sign({ userId: user.id }, "pixelniru", {
    expiresIn: "1h",
  });

  // Create a user object with only the desired properties
  const userToSend = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    profilePictureToShow: user.profilepic,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    token: tokenToSend,
  };

  // Send the response with user, session, and token
  res.status(200).json({
    message: "Login successful",
    user: userToSend,
  });
});

router.get("/logout", userController.destroySession);

router.post("/follow/:userId", userController.followUser);
router.get("/profile/:userid", userController.getUserProfileByUsername);

router.get("/checkIfFollowing", userController.checkIsFollowing);
router.post("/unfollow/:userId", userController.unFollowing);

router.get("/followers/:userId", userController.getFollowers);
router.get("/following/:userId", userController.getFollowing);

router.get("/search", userController.seachUsers);

router.post(
  "/update-profile/:userId",
  upload.single("profilePicture"),
  async (req, res) => {
    const key = randomImageName(); // Generate a random key

    const uploader = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer, // Your file data
        ContentType: req.file.mimetype,
      },
    });

    try {
      await uploader.done(); // Wait for the upload to complete
      const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
      // console.log("Image URL:", imageUrl);

      // Now, we can update the user's profile in the database
      const userId = req.params.userId;
      const bio = req.body.bio;

      // Update the user's profile with the image URL and bio
      await User.findByIdAndUpdate(userId, {
        profilepic: imageUrl,
        bio: bio,
      });

      // Send only the image URL and bio back to the front end
        res.status(200).json({
        message: "Profile updated successfully",
        profilePicture: imageUrl,
        bio: bio,
      });

    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }
);

module.exports = router;
