import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format, isAfter, isBefore, isValid, parseISO, startOfDay } from 'date-fns';
import PropTypes from 'prop-types';
import { getMessaging, onMessage } from '@firebase/messaging';
import { requestFCMToken } from '../utils/firebaseUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const EventContext = createContext();

export const useEventContext = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState({ upcoming: [], today: [], past: [], booked: [] });
  const [event, setEvent] = useState({ title: "", description: "", date: "", location: "", maxAttendees: "", image: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    const messaging = getMessaging();

    const initializeFCM = async () => {
      try {
        const token = await requestFCMToken();
        console.log('FCM Token from context:', token);
        setFcmToken(token);
      } catch (error) {
        console.error('Error fetching FCM token:', error);
      }
    };

    initializeFCM();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);
    });
    fetchEvents();
    getUserTickets();
    return () => {
      unsubscribe();
    }
  }, []);

  const createNewFCM = async () => {
    try {
      const newToken = await requestFCMToken();
      console.log('New FCM Token:(onRefresh)', newToken);
      setFcmToken(newToken);
    } catch (error) {
      console.error('Error generating new FCM token:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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
      const response = await axios.get(`${API_BASE_URL}/api/events/user/tickets`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const userTickets = response.data;
      const bookedEvents = userTickets.map(ticket => ({
        _id: ticket.event._id,
        title: ticket.event.title,
        date: ticket.event.date,
        location: ticket.event.location,
        image: ticket.event.image,
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

  const addEvent = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      setEvent({ title: "", description: "", date: "", location: "", maxAttendees: "", image: "" });
      toast.success("Event added successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error(error.response?.data?.message || "Failed to add event");
    }
  };

  const updateEvent = async (id, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true,
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
      const errorMessage = error.response?.data?.message || "Failed to update event";
      toast.error(errorMessage);
    }
  };

  const deleteEvent = async (id, status) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await axios.post(`${API_BASE_URL}/api/events/${id}/cancel`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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

  const editEvent = (id, status) => {
    setIsEditing(true);
    setEditId(id);
    const eventToEdit = events[status].find(event => event._id === id);
    setEvent(eventToEdit);
  };

  const handleSubmit = async (formData) => {
    if (validateForm()) {
      if (isEditing) {
        await updateEvent(editId, formData);
      } else {
        await addEvent(formData);
      }
      setIsEditing(false);
      setEditId(null);
    } else {
      toast.error("Please fill all required fields correctly.");
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
    events,
    setEvents,
    event,
    setEvent,
    isEditing,
    setIsEditing,
    editId,
    setEditId,
    errors,
    fcmToken,
    setFcmToken,
    editEvent,
    setErrors,
    fetchEvents,
    getUserTickets,
    categorizeEvents,
    determineEventStatus,
    deleteEvent,
    reserveTicket,
    cancelReservation,
    createNewFCM
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

EventProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EventProvider;