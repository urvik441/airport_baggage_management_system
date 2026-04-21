const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Mock Database
const users = new Map(); // ticketNumber -> user
const flights = new Map(); // flightNumber -> { passengers: [] }
const requests = []; // { id, from, to, status, weight }
const chats = new Map(); // roomId -> messages[]

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_flight', ({ ticketNumber, flightNumber }) => {
    socket.join(flightNumber);
    console.log(`User ${ticketNumber} joined flight ${flightNumber}`);
    
    if (!flights.has(flightNumber)) {
      flights.set(flightNumber, { passengers: [] });
    }
    
    const flight = flights.get(flightNumber);
    if (!flight.passengers.find(p => p.ticketNumber === ticketNumber)) {
        const user = users.get(ticketNumber);
        if (user) {
            flight.passengers.push(user);
        }
    }
    
    io.to(flightNumber).emit('flight_update', flight.passengers);
  });

  socket.on('send_request', (request) => {
    const requestId = Date.now().toString();
    const newRequest = { ...request, id: requestId, status: 'pending' };
    requests.push(newRequest);
    
    // Notify the target user if they are online (simplified: notify the whole flight room for now)
    io.to(request.flightNumber).emit('new_request', newRequest);
  });

  socket.on('respond_request', ({ requestId, status }) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
      if (status === 'accepted') {
        const chatRoomId = `chat_${requestId}`;
        chats.set(chatRoomId, []);
        io.to(request.flightNumber).emit('request_accepted', { ...request, chatRoomId });
      } else {
        io.to(request.flightNumber).emit('request_rejected', request);
      }
    }
  });

  socket.on('send_message', ({ roomId, message }) => {
    if (!chats.has(roomId)) {
      chats.set(roomId, []);
    }
    const fullMessage = { ...message, timestamp: new Date() };
    chats.get(roomId).push(fullMessage);
    io.to(roomId).emit('receive_message', fullMessage);
  });

  socket.on('join_chat', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { ticketNumber } = req.body;
  if (!ticketNumber) return res.status(400).json({ error: 'Ticket number required' });
  
  if (!users.has(ticketNumber)) {
    users.set(ticketNumber, {
      ticketNumber,
      wallet: 1000, // Starting balance for simulation
      name: `Passenger ${ticketNumber.slice(-4)}`
    });
  }
  
  res.json(users.get(ticketNumber));
});

app.post('/api/flight/join', (req, res) => {
    const { ticketNumber, flightNumber, totalWeight, limit } = req.body;
    const user = users.get(ticketNumber);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const extraSpace = Math.max(0, limit - totalWeight);
    const excessWeight = Math.max(0, totalWeight - limit);
    
    const flightUser = {
        ...user,
        flightNumber,
        totalWeight,
        limit,
        extraSpace,
        excessWeight
    };
    
    users.set(ticketNumber, flightUser);
    
    if (!flights.has(flightNumber)) {
        flights.set(flightNumber, { passengers: [] });
    }
    
    const flight = flights.get(flightNumber);
    const index = flight.passengers.findIndex(p => p.ticketNumber === ticketNumber);
    if (index > -1) {
        flight.passengers[index] = flightUser;
    } else {
        flight.passengers.push(flightUser);
    }
    
    res.json({ flightUser, passengers: flight.passengers });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
