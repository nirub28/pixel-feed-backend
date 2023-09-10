const User = require("../models/User");

// Function to check if a username is available
module.exports.isUsernameAvailable = async function (req, res) {
  const { username } = req.params;

  try {
    // Use Mongoose's findOne method to find a user with the given username
    const existingUser = await User.findOne({ username: { $regex: new RegExp(username, 'i') } });

    console.log("exsiting user is:", existingUser);

    // If a user with the same username is found, it's not available
    if (existingUser) {
      console.log("user name taken, try different");
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

    console.log("body is:", req.body);

    // Check if the username is available (you can reuse your existing username check logic here)

    if (password != confirmPassword) {
      res.status(500).json({ error: "Password and Confirm password mismatch" });
    }

    // If the username is available, create a new user
    const newUser = await User.create({ username, email, name, password });

    // Optionally, you can return a success message or user data in the response
    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
