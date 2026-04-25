const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Request = require('./models/Request');
const Message = require('./models/Message');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/baggage_sharing';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_flight', async ({ ticketNumber, flightNumber }) => {
    socket.join(flightNumber);
    console.log(`User ${ticketNumber} joined flight ${flightNumber}`);
    
    const passengers = await User.find({ flightNumber });
    io.to(flightNumber).emit('flight_update', passengers);
  });

  socket.on('send_request', async (requestData) => {
    const newRequest = new Request({
        ...requestData,
        status: 'pending'
    });
    await newRequest.save();
    io.to(requestData.flightNumber).emit('new_request', newRequest);
  });

  socket.on('respond_request', async ({ requestId, status }) => {
    const request = await Request.findById(requestId);
    if (request) {
      request.status = status;
      if (status === 'accepted') {
        const chatRoomId = `chat_${requestId}`;
        request.chatRoomId = chatRoomId;
        await request.save();
        // Broadcast to everyone in the flight room so both parties get it
        io.to(request.flightNumber).emit('request_accepted', { 
            id: request._id,
            from: request.from, 
            to: request.to, 
            chatRoomId: chatRoomId,
            status: 'accepted'
        });
      } else {
        await request.save();
        io.to(request.flightNumber).emit('request_rejected', {
            id: request._id,
            from: request.from,
            to: request.to,
            status: 'rejected'
        });
      }
    }
  });

  socket.on('send_message', async ({ roomId, message }) => {
    const newMessage = new Message({
        roomId,
        text: message.text,
        sender: message.sender,
        senderName: message.senderName
    });
    await newMessage.save();
    io.to(roomId).emit('receive_message', newMessage);
  });

  socket.on('join_chat', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      name: name || username,
      wallet: 1000
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/flight/join', async (req, res) => {
    const { username, ticketNumber, flightNumber, totalWeight, limit } = req.body;
    if (totalWeight < 0 || limit < 0) return res.status(400).json({ error: 'Weights cannot be negative' });
    try {
        const extraSpace = Math.max(0, limit - totalWeight);
        const excessWeight = Math.max(0, totalWeight - limit);
        
        const user = await User.findOneAndUpdate(
            { username },
            { ticketNumber, flightNumber, totalWeight, limit, extraSpace, excessWeight },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });
        const passengers = await User.find({ flightNumber });
        res.json({ flightUser: user, passengers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Payment API
app.post('/api/payment/transfer', async (req, res) => {
    // ... (existing code)
});

// Chat History API
app.get('/api/chat/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API Routes
app.get('/api/admin/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const requestCount = await Request.countDocuments();
        const flightCount = (await User.distinct('flightNumber')).length;
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);
        const allRequests = await Request.find().sort({ createdAt: -1 });
        res.json({ stats: { userCount, requestCount, flightCount }, recentUsers, allRequests });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
