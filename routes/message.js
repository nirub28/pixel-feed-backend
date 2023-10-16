const express = require("express");
const router = express.Router();
const Conversation = require("../models/Message");

// Sending a message
router.post('/send-message', async (req, res) => {
  const { sender, receiver, content } = req.body;

  // console.log("all det", sender, receiver, "content ", content);


  try {
    // Check if a conversation already exists, or create a new one
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, receiver],
      });
    }

    // Add the message to the conversation
    conversation.messages.push({
      sender,
      content,
      timestamp: new Date(),
    });

    // Save the conversation
    await conversation.save();

    res.json({ message: 'Message sent' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Retrieving messages
router.get('/get-messages', async (req, res) => {
  const { sender, receiver } = req.query;

  

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Sort messages by timestamp
    const messages = conversation.messages.sort((a, b) =>
      a.timestamp - b.timestamp
    );

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});


module.exports = router;
