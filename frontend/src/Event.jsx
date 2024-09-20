import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { format, isBefore, isAfter, parseISO, startOfDay, isValid } from "date-fns";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box } from "@mui/material";
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import BookedEvents from './BookedEvents';
import axios from 'axios';
import { inputStyle, VisuallyHiddenInput } from "./config";


//vite env acceass
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function Event() {
  const [events, setEvents] = useState({ upcoming: [], today: [], past: [], booked: [] });
  const [event, setEvent] = useState({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState({ name: "John Doe", role: "admin" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEvents();
    getUserTickets();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      console.log(response.data);
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
      const response = await axios.get(`${API_BASE_URL}/api/events/user/tickets`,{withCredentials: true});
      console.log(response.data);
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
      booked: []
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
      return 'upcoming'; // Default to 'upcoming' or handle as appropriate
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
        updateEvent();
      } else {
        addEvent();
      }
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const addEvent = async () => {
    if (validateForm()) {
      try {
        const eventData = {
          ...event,
          maxAttendees: parseInt(event.maxAttendees, 10),
          imageUrl: event.imageUrl || "",
          date: parseISO(event.date).toISOString(),
          status: determineEventStatus(event.date), 
        };
        console.log(eventData, "eventData");

        const response = await axios.post(`${API_BASE_URL}/api/events`, eventData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
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
      } catch (error) {
        console.error("Error adding event:", error);
        toast.error(error.response?.data?.message || "Failed to add event");
      }
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

  const editEvent = (id, status) => {
    setIsEditing(true);
    setEditId(id);
    const eventToEdit = events[status].find(event => event._id === id);
    setEvent(eventToEdit);
  };

  const updateEvent = async () => {
    console.log(editId, "event");
    try {
      const response = await axios.put(`${API_BASE_URL}/api/events/${editId}`, event, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedEvent = response.data.updatedEvent;
      console.log(updatedEvent, "updatedEvent");
      setEvents(prev => ({
        ...prev,
        upcoming: prev.upcoming.map(item => item._id === editId ? updatedEvent : item),
        today: prev.today.map(item => item._id === editId ? updatedEvent : item),
        past: prev.past.map(item => item._id === editId ? updatedEvent : item)
      }));
      setIsEditing(false);
      setEditId(null);
      setEvent({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const reserveTicket = async (id, status) => {
    if (status === 'past') {
      toast.error("Cannot book tickets for past events.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/buy/${id}`, {}, {
        withCredentials: true
      });
      const updatedEvent = response.data.event;
      setEvents(prev => {
        const isAlreadyBooked = prev.booked.some(event => event._id === id);
        
        if (isAlreadyBooked) {
          // Increase ticket count for already booked event
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
          // Add new booked event
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {isEditing || user.role === "admin" ? (
        <Box
          component="form"
          sx={{ '& .MuiTextField-root': { m: 1 } }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <TextField
            label="Event Title"
            variant="outlined"
            size="small"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            fullWidth
            sx={inputStyle}
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            label="Event Description"
            variant="outlined"
            size="small"
            value={event.description}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
            sx={inputStyle}
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            label="Event Date"
            variant="outlined"
            size="small"
            type="date"
            value={event.date}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={inputStyle}
            error={!!errors.date}
            helperText={errors.date}
            inputProps={{
              min: format(new Date(), 'yyyy-MM-dd')
            }}
          />
          <TextField
            label="Event Location"
            variant="outlined"
            size="small"
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            fullWidth
            sx={inputStyle}
            error={!!errors.location}
            helperText={errors.location}
          />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label="Max Attendees"
                variant="outlined"
                size="small"
                type="number"
                value={event.maxAttendees}
                onChange={(e) => setEvent({ ...event, maxAttendees: e.target.value })}
                fullWidth
                sx={inputStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">people</InputAdornment>,
                }}
                error={!!errors.maxAttendees}
                helperText={errors.maxAttendees}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload Image
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
        </Box>
      ) : null}
      <div className="flex flex-col md:flex-row gap-6">
        {['upcoming', 'today', 'past'].map((status) => (
          <div key={status} className="flex-1 p-4 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 capitalize text-gray-700">{status} Events</h2>
            {events[status].map((event) => (
              <div key={event._id} className="bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
                <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-gray-600">{format(parseISO(event.date), 'PPP')}</p>
                  <p className="text-gray-600">Max Attendees: {event.maxAttendees}</p>
                  <div className="flex space-x-2 mt-4">
                    {status !== 'past' && (
                      <button
                        onClick={() => reserveTicket(event._id, status)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                      >
                        Reserve Ticket
                      </button>
                    )}
                    {user.role === "admin" && (
                      <>
                        <button
                          onClick={() => editEvent(event._id, status)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEvent(event._id, status)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <BookedEvents 
          bookedEvents={events.booked} 
          cancelReservation={cancelReservation} 
        />
      </div>
    </div>
  );
}

export default Event;