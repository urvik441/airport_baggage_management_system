const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  wallet: { type: Number, default: 1000 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  ticketNumber: { type: String },
  flightNumber: { type: String },
  totalWeight: { type: Number },
  limit: { type: Number },
  extraSpace: { type: Number },
  excessWeight: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
