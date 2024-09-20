import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format, isAfter, isBefore, isValid, parseISO, startOfDay } from 'date-fns';
import PropTypes from 'prop-types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const EventContext = createContext();

export const useEventContext = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState({ upcoming: [], today: [], past: [], booked: [] });
  const [event, setEvent] = useState({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEvents();
    getUserTickets();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      console.log(response.data, "response.data");
      const formattedEvents = response.data.events.map(event => ({
        ...event,
        date: format(parseISO(event.date), 'yyyy-MM-dd')
      }));
      categorizeEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    }
  };

  const getUserTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/user/tickets`, { withCredentials: true });
      const userTickets = response.data;
      const bookedEvents = userTickets.map(ticket => ({
        _id: ticket.event._id,
        title: ticket.event.title,
        date: ticket.event.date,
        location: ticket.event.location,
        imageUrl: ticket.event.imageUrl,
        ticketCount: ticket.quantity,
        isCreator: ticket.isCreator
      }));
      setEvents(prev => ({
        ...prev,
        booked: bookedEvents
      }));
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      toast.error('Failed to fetch user tickets');
    }
  };

  const categorizeEvents = (eventList) => {
    const categorized = {
      upcoming: [],
      today: [],
      past: [],
      booked: events.booked
    };

    eventList.forEach(event => {
      const status = determineEventStatus(event.date);
      categorized[status].push(event);
    });
    setEvents(categorized);
  };

  const determineEventStatus = (date) => {
    if (!date) {
      console.error('No date provided');
      return 'upcoming';
    }

    try {
      const eventDate = parseISO(date);
      if (!isValid(eventDate)) {
        console.error('Invalid date provided:', date);
        return 'upcoming';
      }

      const now = new Date();
      
      if (isBefore(eventDate, startOfDay(now))) {
        return 'past';
      } else if (isAfter(eventDate, now)) {
        return 'upcoming';
      } else {
        return 'today';
      }
    } catch (error) {
      console.error('Error processing date:', error);
      return 'upcoming';
    }
  };

  const addEvent = async () => {
    console.log(event, "event");
    try {
      const eventData = {
          ...event,
          maxAttendees: parseInt(event.maxAttendees, 10),
          imageUrl: event.imageUrl || "",
          date: parseISO(event.date).toISOString(),
          status: determineEventStatus(event.date), 
        };
        fetchEvents();
        console.log(eventData, "eventData");

        const response = await axios.post(`${API_BASE_URL}/api/events`, eventData, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        });
        const newEvent = response.data;
        setEvents(prev => {
          const updatedCategory = prev[newEvent.status] ? [...prev[newEvent.status], newEvent] : [newEvent];
          return {
            ...prev,
            [newEvent.status]: updatedCategory
          };
        });
        setEvent({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
        toast.success("Event added successfully!");
        fetchEvents();
      } catch (error) {
        console.error("Error adding event:", error);
        toast.error(error.response?.data?.message || "Failed to add event");
    }
  };


  const updateEvent = async (id, eventData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/events/${id}`, eventData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedEvent = response.data.updatedEvent;
      setEvents(prev => ({
        ...prev,  
        upcoming: prev.upcoming.map(item => item._id === id ? updatedEvent : item),
        today: prev.today.map(item => item._id === id ? updatedEvent : item),
        past: prev.past.map(item => item._id === id ? updatedEvent : item)
      }));
      fetchEvents();
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const deleteEvent = async (id, status) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`, {
        withCredentials: true
      });
      setEvents(prev => ({
        ...prev,
        [status]: prev[status].filter(event => event._id !== id)
      }));
      toast.success("Event deleted!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const reserveTicket = async (id, status) => {
    if (status === 'past') {
      toast.error("Cannot book tickets for past events.");
      return;
    }
    console.log("reserveTicket", id, status);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/buy/${id}`, {}, {
        withCredentials: true
      });
      const updatedEvent = response.data.event;
      setEvents(prev => {
        const isAlreadyBooked = prev.booked.some(event => event._id === id);
        
        if (isAlreadyBooked) {
          const updatedBooked = prev.booked.map(event => 
            event._id === id 
              ? { ...event, ticketCount: (event.ticketCount || 1) + 1 }
              : event
          );
          return {
            ...prev,
            [status]: prev[status].map(event => event._id === id ? updatedEvent : event),
            booked: updatedBooked
          };
        } else {
          return {
            ...prev,
            [status]: prev[status].map(event => event._id === id ? updatedEvent : event),
            booked: [...prev.booked, { ...updatedEvent, ticketCount: 1 }]
          };
        }
      });
      toast.success("Ticket reserved successfully!");
    } catch (error) {
      console.error("Error reserving ticket:", error);
      toast.error("Failed to reserve ticket");
    }
  };

  const cancelReservation = async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/events/${id}/cancel`, {}, {
        withCredentials: true
      });
      const updatedEvent = response.data;
      setEvents(prev => {
        const updatedBooked = prev.booked.filter(event => event._id !== id);
        const returnCategory = determineEventStatus(updatedEvent.date);
        return {
          ...prev,
          booked: updatedBooked,
          [returnCategory]: [...prev[returnCategory], updatedEvent]
        };
      });
      toast.success("Reservation cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.title = event.title ? "" : "Title is required";
    tempErrors.description = event.description ? "" : "Description is required";
    tempErrors.location = event.location ? "" : "Location is required";
    tempErrors.maxAttendees = event.maxAttendees && parseInt(event.maxAttendees, 10) > 0 
      ? "" 
      : "Max attendees must be a positive number";
    
    // Date validation
    if (!event.date) {
      tempErrors.date = "Date is required";
    } else {
      const parsedDate = parseISO(event.date);
      if (!isValid(parsedDate)) {
        tempErrors.date = "Invalid date format";
      } else if (isBefore(parsedDate, startOfDay(new Date()))) {
        tempErrors.date = "Event date cannot be in the past";
      }
    }
  
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditing) {
        updateEvent(event._id, event);
      } else {
        addEvent();
      }
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };


  const editEvent = (id, status) => {
    setIsEditing(true);
    setEditId(id);
    const eventToEdit = events[status].find(event => event._id === id);
    setEvent(eventToEdit);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvent({ ...event, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const formattedDate = format(parseISO(inputDate), 'yyyy-MM-dd');
      setEvent({ ...event, date: formattedDate });
    } else {
      setEvent({ ...event, date: '' });
    }
  };

  const value = {
    handleSubmit,
    handleDateChange,
    handleImageUpload,
    events,
    setEvents,
    event,
    setEvent,
    isEditing,
    setIsEditing,
    editId,
    setEditId,
    errors,
    editEvent,
    setErrors,
    fetchEvents,
    getUserTickets,
    categorizeEvents,
    determineEventStatus,
    addEvent,
    updateEvent,
    deleteEvent,
    reserveTicket,
    cancelReservation
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

EventProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
  