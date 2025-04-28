// backendStuff/routes/chatRoutes.js
const express = require('express');
const { connectDB } = require('../lib/db');

const router = express.Router();

// Save a chat session
router.post('/save-chat', async (req, res) => {
  try {
    const db = await connectDB();
    const chatCollection = db.collection('chatHistory');

    const { sessionId, clientId, messages } = req.body;

    if (!sessionId || !clientId || !messages) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const chatSession = {
      sessionId,
      clientId,
      messages,
      createdAt: new Date()
    };

    await chatCollection.insertOne(chatSession);

    res.status(201).json({ message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Save Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
