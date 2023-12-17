const express = require("express");
const router = express.Router();
const Conversation = require("../models/Message");

// Sending a message
router.post("/send-message", async (req, res) => {
  const { sender, room, content } = req.body;

  try {
    // Check if a conversation already exists, or create a new one
    let conversation = await Conversation.findOne({
      _id: room,
    });
    // console.log("id is",conversation);


    if (!conversation) {
      return;
    }

    // Add the message to the conversation
    conversation.messages.push({
      sender,
      content,
      timestamp: new Date(),
    });

    // Save the conversation
    await conversation.save();

    res.json({ message: "Message sent" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Error sending message" });
  }
});


// Fetch all conversations for a specific user
router.get("/conversations/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profilepic") // Optionally populate participant details
      .exec();

    // console.log("values",values)
    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Error fetching conversations" });
  }
});

// Fetch conversation details based on conversation ID
router.get("/conversation-details/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.query; // Use req.query to access query parameters

  try {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username profilepic")
      .exec();

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const otherUser = conversation.participants.find(
      (participant) => participant._id != userId
    );

    res.json({ otherUser });
  } catch (err) {
    console.error("Error fetching conversation details:", err);
    res.status(500).json({ error: "Error fetching conversation details" });
  }
});

// Retrieving messages for a specific conversation
router.get("/get-messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;


  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Sort messages by timestamp
    const messages = conversation.messages.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});


// Check if a room exists for two users
router.get("/check-room", async (req, res) => {
  const { user1, user2 } = req.query;

  try {
    // Check if a conversation already exists for the two users
    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });

    if (conversation) {
      res.json({ roomExists: true, roomId: conversation._id });
    } else {
      res.json({ roomExists: false });
    }
  } catch (err) {
    console.error("Error checking room:", err);
    res.status(500).json({ error: "Error checking room" });
  }
});


// Create a new room for two users
router.post("/create-room", async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    // Create a new conversation for the two users
    const newConversation = new Conversation({
      participants: [user1, user2],
    });

    // Save the new conversation
    const savedConversation = await newConversation.save();

    res.json({ roomId: savedConversation._id });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Error creating room" });
  }
});


module.exports = router;
