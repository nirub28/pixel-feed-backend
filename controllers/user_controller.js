const User = require("../models/User");
const bcrypt = require("bcrypt");

// Function to check if a username is available
module.exports.isUsernameAvailable = async function (req, res) {
  const username = req.query.username;

  try {
    // Use Mongoose's findOne method to find a user with the given username
    const existingUser = await User.findOne({ username: username });

    // If a user with the same username is found, it's not available
    if (existingUser) {
      res.json({ isAvailable: false });
    } else {
      // If no user with the same username is found, it's available
      res.json({ isAvailable: true });
    }
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle user registration
module.exports.signup = async function (req, res) {
  try {
    const { username, email, name, password, confirmPassword } = req.body;

    // Check if the username is available (you can reuse your existing username check logic here)

    if (password != confirmPassword) {
      res.status(400).json({
        success: false,
        error: "Password and Confirm Password do not match",
      });
      return; // Return to exit the function
    }

    // Check if the email is available
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      res
        .status(400)
        .json({ success: false, error: "Email is already registered" });
      return;
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // If the username is available, create a new user
    const newUser = await User.create({
      username,
      email,
      name,
      password: hashedPassword,
    });

    // Optionally, you can return a success message or user data in the response
    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.destroySession = function (req, res) {
  // Destroy the session
  req.logout(function (err) {
    if (err) {
      console.log("Unable to destroy session:", err);
      return res.status(500).json({ message: "Unable to logout" });
    }

    // If the session is successfully destroyed, send a response
    res.json({ message: "Logout successful" });
  });
};

// Follow a user
module.exports.followUser = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body;

  try {
    // Find the target user by userId
    const targetUser = await User.findById(userId);

    // Add the current user to the followers list of the target user
    targetUser.followers.push(currentUserId);

    // Save the updated target user data
    await targetUser.save();

    // Find the current user by their ID
    const currentUser = await User.findById(currentUserId);

    // Add the target user's ID to the following list of the current user
    currentUser.following.push(userId);

    // Save the updated current user data
    await currentUser.save();

    // Return a success response or updated user data
    res
      .status(200)
      .json({ message: "User followed successfully", updatedUser: targetUser });
  } catch (error) {
    // Handle errors
    console.error("Error following user:", error);
    res.status(500).json({ error: "Error following user" });
  }
};

// Get user profile by username
module.exports.getUserProfileByUsername = async (req, res) => {
  const { userid } = req.params;
  // console.log("user name", userid)

  try {
    // Find the user by username
    const user = await User.findOne({ _id: userid });

    if (!user) {
      // Handle the case where the user with the given username is not found
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's profile data
    // console.log(user);
    res.status(200).json(user);
  } catch (error) {
    // Handle errors
    console.error("Error fetching user profile by username:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

// to check if user is follwed
module.exports.checkIsFollowing = async (req, res) => {
  const { userId, currentUserId } = req.query;
  // console.log("user name", userId,currentUserId );

  try {
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ isFollowing: false });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);
    res.json({ isFollowing });
  } catch (error) {
    console.error("Error checking if following:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//unfollow user
module.exports.unFollowing = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body;

  try {
    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    // console.log(currentUser);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove the current user from the target user's followers list

    targetUser.followers = targetUser.followers.filter(
      (followerId) => followerId.toString() !== currentUserId
    );

    // Remove the target user from the current user's following list
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== userId
    );

    // Save the updated user data for both users
    await targetUser.save();
    await currentUser.save();

    // Return a success response or updated user data
    res
      .status(200)
      .json({
        message: "User unfollowed successfully",
        updatedUser: currentUser,
      });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("followers");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followers = user.followers; // 'followers' is an array of user IDs

    res.json({ followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get users followed by a user
exports.getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("following"); //  you have a 'following' field in your User model

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following; //  'following' is an array of user IDs

    res.json({ following });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user profile (including bio and profile picture)
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio } = req.body;
    const profilePicture = req.body; 

    console.log("user is",req.body);


    const user = await User.findById(userId).select('-password'); // Exclude the password field

    // console.log("user is",user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Only update the bio if the request contains a bio value
    if (bio) {
      user.bio = bio;
    }

    // Only update the profile picture if a file was uploaded
    if (profilePicture) {
      user.profilepic = profilePicture;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// users search
exports.seachUsers = async (req, res) => {
  const { query } = req.query;


  try {
    // Use a Mongoose query to find users matching the name or username
    const results = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, 
        { username: { $regex: query, $options: 'i' } }, 
      ],
    });

    res.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
