const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reserveTicket,
  cancelReservation
} = require('../controller/EventsController');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/reserve', reserveTicket);
router.post('/:id/cancel', cancelReservation);

module.exports = router;