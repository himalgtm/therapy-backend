// server.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // HTTP wrapper for Socket.io

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connection successful');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Middlewares
app.use(cors());
app.use(express.json());

// Importing routes
const authRoute = require('./routes/auth');
const paymentsRoutes = require('./routes/payments');
const messagesRoutes = require('./routes/messages');

// Route middlewares
app.use('/api/user', authRoute);
app.use('/api/payments', paymentsRoutes);
app.use('/api/messages', messagesRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Therapy backend server running with REST and REAL-TIME ⚡');
});

// SOCKET.IO Logic for Real-Time Messaging
io.on('connection', (socket) => {
  console.log('🔵 New user connected:', socket.id);

  socket.on('sendMessage', async (data) => {
    console.log('✉️ New message received:', data);

    try {
      // Save message using Mongoose Model
      const Message = require('./models/Message');
      const newMessage = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
      });
      const savedMessage = await newMessage.save();

      // Emit back to all connected clients
      io.emit('receiveMessage', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
