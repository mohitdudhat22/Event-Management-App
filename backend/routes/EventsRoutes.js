const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  cancelReservation,
  buyTicket,
  getUserTickets,
  getEventTickets
} = require('../controller/EventsController');
const upload = require('../cloudinary/multer');
const {authorize} = require('../middleware/roleMiddleware');
router.get('/',authorize(['admin', 'user']), getAllEvents);
router.get('/:id',authorize(['admin', 'user']), getEventById);
router.post('/',upload.single('image'), createEvent); 
router.put('/:id',upload.single('image'), updateEvent);
router.delete('/:id',authorize(['admin']), deleteEvent);
router.post('/buy/:id',authorize(['admin', 'user']), buyTicket);
router.get('/user/tickets',authorize(['admin', 'user']), getUserTickets)

//give us the tickets of the event (different Persons)
router.get('/tickets/:id',authorize(['admin', 'user']), getEventTickets);


router.post('/:id/cancel',authorize(['admin', 'user']), cancelReservation);
module.exports = router;