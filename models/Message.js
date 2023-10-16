const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model for participants
    },
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for the sender
      },
      content: String,
      timestamp: Date,
    },
  ],
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
