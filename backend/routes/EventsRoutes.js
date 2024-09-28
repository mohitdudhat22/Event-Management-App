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
const {authorize} = require('../middleware/roleMiddleware');
router.get('/',authorize(['admin', 'user']), getAllEvents);
router.get('/:id',authorize(['admin', 'user']), getEventById);
router.post('/',authorize(['admin']), createEvent);
router.put('/:id',authorize(['admin']), updateEvent);
router.delete('/:id',authorize(['admin']), deleteEvent);
router.post('/buy/:id',authorize(['admin', 'user']), buyTicket);
router.get('/user/tickets', authorize(['admin', 'user']),getUserTickets)

//give us the tickets of the event (different Persons)
router.get('/tickets/:id',authorize(['admin', 'user']), getEventTickets);


router.post('/:id/cancel',authorize(['admin', 'user']), cancelReservation);
module.exports = router;