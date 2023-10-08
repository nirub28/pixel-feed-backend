const express = require("express");
const passport = require("passport");
const router = express.Router();
const postController = require("../controllers/post_controller");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");
const sharp = require("sharp");

const multer = require("multer");
const upload = multer(); // Initialize multer

const cryto = require("crypto");

const randomImageName = (bytes = 32) =>
  cryto.randomBytes(bytes).toString("hex"); // to create a random name

//  the desired width and height constraints
const maxWidth = 1080;
const minWidth = 566;
const minHeight = 566;
const maxHeight = 1350;

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

router.post("/create/:userId", upload.single("Picture"), async (req, res) => {
  const userId = req.params.userId;
  const caption = req.body.caption;

  //console.log("file is", req.body);

  const resizedImageBuffer = await sharp(req.file.buffer)
    .resize({ width: maxWidth, height: maxHeight })
    .toBuffer();

  const imageName = randomImageName(); // Generate a random key

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: resizedImageBuffer,
    ContentType: req.file.mimetype,
  };

  try {
    const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${imageName}`;
    await s3.send(new PutObjectCommand(params)); // Wait for the upload to complete

    // Create a new Post document
    const post = new Post({
      caption: caption,
      image: imageUrl,
      user: userId,
    });

    // Save the post to the database
    await post.save();
    // Return a success response
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get posts by user ID
router.get("/:userId/posts", async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get post by id
router.get("/info/:imageId", async (req, res) => {
  try {
    const imageId = req.params.imageId;
    // console.log("I am triggered",imageId);
    const post = await Post.findById({ _id: imageId });
    if (post) {
      res.json(post);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to add a new comment
router.post("/add-comment", postController.addComment);
router.delete(
  "/delete-comment/:imageId/:commentId",
  postController.deleteComment
);
router.post("/like/:postId", postController.addLike);
router.get("/likes/:imageId", postController.likesCount);
router.get("/all", postController.getAllPosts);
router.post("/liking/:imageId", postController.addLiking);

module.exports = router;
