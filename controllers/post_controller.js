const User = require("../models/User");
const Post = require("../models/Post");

exports.addComment = async function (req, res) {
  const { postId, userId, text } = req.body;

  if (!postId || !userId || !text) {
    return res
      .status(400)
      .json({ message: "Invalid request. Missing required data." });
  }

  try {
    // Fetch user data from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create the comment object
    const comment = {
      user: userId, // Store the user ObjectId
      username: user.username, // Store the username
      profilepic: user.profilepic, // Store the profile picture URL
      text,
    };

    // Find the post by postId and push the comment
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    );

    // Extract only the comment data you need to send in the response
    const addedComment = post.comments[post.comments.length - 1];

    // Send the added comment data in the response
    res.json(addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteComment = async function (req, res) {
  const commentId = req.params.commentId;
  const imageId = req.params.imageId;

  try {
    // Find the post that corresponds to the given imageId
    const post = await Post.findById(imageId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the index of the comment in the comments array
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove the comment from the comments array
    post.comments.splice(commentIndex, 1);

    // Save the updated post
    await post.save();

    res.sendStatus(204); // Successful deletion (No Content)
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addLike = async function (req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.body.userId; 

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex === -1) {
      // User hasn't liked the post, so add their ID to the likes array
      post.likes.push(userId);
    } else {
      // User has already liked the post, so remove their ID from the likes array
      post.likes.splice(likedIndex, 1);
    }

    // Save the updated post
    await post.save();

    // Respond with the updated likes data
    res.status(200).json({ count: post.likes.length, users: post.likes, likeorunlike:likedIndex });
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.likesCount = async function (req, res) {
  try {
    const postId = req.params.imageId;

    // console.log("checking", postId);

    // Fetch the post by its ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Respond with the likes data (count and user IDs who liked the post)
    res.status(200).json({ count: post.likes.length, users: post.likes });
  } catch (error) {
    console.error('Error fetching likes data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

};


// Controller to fetch posts for specified user IDs
exports.getAllPosts = async (req, res) => {
  try {
    const { userIds } = req.query;


    // Parse the user IDs from the request query string
    const parsedUserIds = userIds.split(',');

    // Fetch posts for the specified user IDs from your database
    const posts = await Post.find({ user: { $in: parsedUserIds } })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilepic'); // Populate the 'user' field with 'username' and 'profilepic' fields


    // Return the fetched posts as JSON
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





exports.addLiking = async function (req, res) {
  try {
    const postId = req.params.imageId;
    const userId = req.body.userId; 

    // console.log("ids are",postId,userId);


    const post = await Post.findById(postId).populate('user', 'username profilepic');

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex === -1) {
      // User hasn't liked the post, so add their ID to the likes array
      post.likes.push(userId);
    } else {
      // User has already liked the post, so remove their ID from the likes array
      post.likes.splice(likedIndex, 1);
    }

    // Save the updated post
    await post.save();

    // Respond with the updated likes data
    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};