const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
//ticket -> ticketsSold++ 