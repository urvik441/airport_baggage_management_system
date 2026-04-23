const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  from: { type: String, required: true }, // ticketNumber or username
  to: { type: String, required: true },   // ticketNumber or username
  flightNumber: { type: String, required: true },
  weight: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  chatRoomId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
