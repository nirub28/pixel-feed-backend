const User = require("../models/User");
const bcrypt = require('bcrypt');


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
      res
        .status(400)
        .json({
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
    const newUser = await User.create({ username, email, name, password: hashedPassword, });

    // Optionally, you can return a success message or user data in the response
    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports.destroySession = function (req, res) {
    // Destroy the session
    req.session.destroy(function (err) {
      if (err) {
        console.log("Unable to destroy session:", err);
        return res.status(500).json({ message: "Unable to logout" });
      }
      
      // If the session is successfully destroyed, send a response
      res.json({ message: "Logout successful" });
    });
  };
  