const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Add a notification
router.post("/send", async (req, res) => {
  const { senderId, receiverId, type, postId } = req.body;

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
      .populate("postId", "caption"); // Add fields you want to populate

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Mark notifications as read
router.patch("/mark-read/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    await Notification.updateMany({ receiver: userId }, { isRead: true });
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
