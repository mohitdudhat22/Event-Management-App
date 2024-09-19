const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reserveTicket,
  cancelReservation,
  buyTicket,
  getUserTickets,
  getEventTickets
} = require('../controller/EventsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/buy/:id',authMiddleware, buyTicket);
router.get('/user/tickets',authMiddleware ,getUserTickets)

//give us the tickets of the event (different Persons)
router.get('/tickets/:id', getEventTickets);
router.post('/:id/cancel', cancelReservation);
module.exports = router;