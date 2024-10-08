const Event = require('../models/Events');
const Ticket = require('../models/Tickets');
const User = require('../models/User');
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ message: 'Events fetched successfully', events});
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

    const { title, description, date, location, maxAttendees, status} = req.body;
    const image = req.file ? req.file.path : null; 
    try {
        const newEvent = await Event.create({ title, description, date, location, maxAttendees, image, creator: req.user.id, status, ticketsSold: 0 , tickets: [] , status});
        newEvent.save();
        res.status(201).json({ message: 'Event created successfully', newEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateEvent = async (req, res) => {
    const id = req.params.id;
    const newImage = req.file ? req.file.path : null;
    const { title, description, date, location, maxAttendees, status } = req.body;

    try {
        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const imageToUpdate = newImage || existingEvent.image;

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { title, description, date, location, maxAttendees, image: imageToUpdate, status },
            { new: true }
        );

        res.json({ message: 'Event updated successfully', updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: error.message });
    }
};



const deleteEvent = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedEvent = await Event.findByIdAndDelete(id);
        await Ticket.deleteMany({ event: id });
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).send({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const reserveTicket = async (req, res) => {
    const id = req.params.id;

    try {
        const event = await Event.findById(id);
        console.log(event); 
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.ticketSold >= event.maxAttendees) {
            return res.status(400).json({ error: 'Event is full' });
        }
        event.ticketSold++;
        const updatedEvent = await Event.findByIdAndUpdate(id, { ticketSold: event.ticketSold },{new: true});
        res.json({ message: 'Ticket reserved successfully', updatedEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const cancelReservation = async (req, res) => {
    const id = req.params.id;
    console.id
    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.ticketSold >= event.maxAttendees) {
            return res.status(400).json({ error: 'No tickets to cancel' });
        }
        event.ticketSold++;
        const updatedEvent = await event.save();
        res.json({ message: 'Reservation canceled successfully', updatedEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const buyTicket = async (req, res) => {
    const id = req.params.id;
    try {
        const event = await Event.findById(id).populate('tickets');
        console.log(event)
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.ticketCount <= 0) {
            return res.status(400).json({ error: 'No tickets to buy' });
        }
        const user = await User.findById(req.user.id);
        const ticket = await Ticket.findOne({ event: event.id, user: user.id });
        if (ticket) {
            event.ticketsSold++;
            ticket.quantity++;
            await ticket.save();
            await event.save();
            return res.json({ message: 'Ticket bought successfully (Added in existing ticket)', event });
        }

        const newTicket = await Ticket.create({ event, user: req.user.id});
        event.tickets.push(newTicket);
        event.ticketsSold++;
        const updatedEvent = await event.save();
        await newTicket.save();

        res.json({ message: 'Ticket bought successfully', updatedEvent , newTicket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id })
            .populate('event')
            .lean();

        const user = await User.findById(req.user.id);
        const createdEvents = await Event.find({ creator: user.id });

        const ticketsWithEvents = tickets.map(ticket => ({
            ...ticket,
            event: ticket.event,
            isCreator: createdEvents.some(event => event._id.toString() === ticket.event._id.toString())
        }));
        res.json(ticketsWithEvents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getEventTickets = async (req, res) => {
    try {
      const tickets = await Ticket.find({ event: req.params.id })
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};


module.exports = {
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
};
