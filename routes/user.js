const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/user_controller");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const multer = require("multer");
const upload = multer(); // Initialize multer

const cryto = require("crypto");

const randomImageName = (bytes = 32) =>
  cryto.randomBytes(bytes).toString("hex"); // to create a random name

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

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
    profilePicture: user.profilepic,
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
    const userId = req.params.userId;
    const bio = req.body.bio;

    // Check if a profile picture was sent
    if (req.file) {
      const myUser = await User.findById(userId);

      if (myUser.profilepic) {
        const imageUrl = myUser.profilepic;
        const parts = imageUrl.split("/");
        const imageKey = parts[parts.length - 1];
        // console.log("image key is",key );

        const deleteParams = {
          Bucket: bucketName,
          Key: imageKey,
        };

        try {
          // Send the delete command to S3
          await s3.send(new DeleteObjectCommand(deleteParams));
        } catch (error) {
          console.error("Error deleting object:", error);
        }
      }

      const imageName = randomImageName(); // Generate a random key

      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      try {
        const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${imageName}`;
        await s3.send(new PutObjectCommand(params)); // Wait for the upload to complete

        // Update the user's profile with the image URL

        if (myUser) {
          myUser.profilepic = imageUrl;
          await myUser.save();
        } else {
          // Handle the case where the user is not found
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    // Always update the bio (if provided)
    const myUser = await User.findById(userId);

    if (myUser) {
      myUser.bio = bio;
    } else {
      // Handle the case where the user is not found
      console.error("User not found");
    }

    // Save the updated user document
    await myUser.save();

    // Prepare the response
    res.status(200).json({
      message: "Profile picture updated successfully",
      profilepic: myUser.profilepic,
      bio: myUser.bio,
    });
  }
);


module.exports = router;
