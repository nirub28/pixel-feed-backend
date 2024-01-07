const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Add a notification
router.post("/send", async (req, res) => {
  const { senderId, receiverId, type, postId } = req.body;

  // console.log("details",senderId,  receiverId , type, postId);

  try {
    const notification = new Notification({
      sender: senderId,
      receiver: receiverId,
      type,
      postId,
    });

    await notification.save();

    // You can emit a socket event here to notify the user in real-time
    // Example: io.to(receiverId).emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch notifications for a user
router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "username profilepic") // Add fields you want to populate
      .populate({
        path: "postId",
        select: "image",
        match: { $expr: { $ne: ["$type", "follow"] } }, // Exclude "follow" notifications
      });  //the populate method for "postId" includes a match option that uses
      // the $expr operator to compare the "type" field and exclude notifications 
      //with the type "follow" from being populated with the "postId" field.

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete all notifications for a user
router.delete("/delete-notifications/:userId", async (req, res) => {
  const userId = req.params.userId;
  // console.log("id fd user",userId)
  try {
    // Delete all notifications for the specified user
    await Notification.deleteMany({ receiver: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a follow notification
router.post("/sendfollow", async (req, res) => {
  const { senderId, receiverId, type } = req.body;

  // console.log("details",senderId,  receiverId , type);

  try {
    const notification = new Notification({
      sender: senderId,
      receiver: receiverId,
      type,
    });

    await notification.save();

    // You can emit a socket event here to notify the user in real-time
    // Example: io.to(receiverId).emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
