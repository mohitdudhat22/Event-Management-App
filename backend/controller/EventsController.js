const Event = require('../models/Events');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ message: 'Events fetched successfully', events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        res.json({ message: 'Event fetched successfully', event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    const { title, description, date, location, maxAttendees, imageUrl } = req.body;
    try {
        const newEvent = await Event.create({ title, description, date, location, maxAttendees, imageUrl, createdBy: req.user.id });
        newEvent.save();
        res.status(201).json({ message: 'Event created successfully', newEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const id = req.params.id;
    const { title, description, date, location, maxAttendees, imageUrl } = req.body;

    try {
        const updatedEvent = await Event.findByIdAndUpdate(id, { title, description, date, location, maxAttendees, imageUrl });
        updatedEvent.save();
        res.json({ message: 'Event updated successfully', updatedEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    const id = req.params.id;
    try {
        await Event.findByIdAndDelete(id);
        res.status(204).send({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const reserveTicket = async (req, res) => {
    const id = req.params.id;
    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.maxAttendees <= event.ticketCount) {
            return res.status(400).json({ error: 'Event is full' });
        }
        event.ticketCount++;
        await event.save();
        res.json({ message: 'Ticket reserved successfully', event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cancelReservation = async (req, res) => {
    const id = req.params.id;
    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.ticketCount <= 0) {
            return res.status(400).json({ error: 'No tickets to cancel' });
        }
        event.ticketCount--;
        const updatedEvent = await event.save();
        res.json({ message: 'Reservation canceled successfully', updatedEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllEvents,  
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    reserveTicket,
    cancelReservation
};
