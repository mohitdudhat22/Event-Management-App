import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { format, isBefore, isAfter, parseISO, isToday, startOfDay } from "date-fns";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Box } from "@mui/material";
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import BookedEvents from './BookedEvents';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: '50%',
});

function Event() {
  const [events, setEvents] = useState({ upcoming: [], today: [], past: [], booked: [] });
  const [event, setEvent] = useState({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState({ name: "John Doe", role: "admin" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    categorizeEvents();
  }, []);

  const determineEventStatus = (date) => {
    const eventDate = parseISO(date);
    const now = new Date();
    if (isBefore(eventDate, now) && !isToday(eventDate)) {
      return 'past';
    } else if (isAfter(eventDate, now) && !isToday(eventDate)) {
      return 'upcoming';
    } else {
      return 'today';
    }
  };

  const categorizeEvents = () => {
    const categorized = {
      upcoming: [],
      today: [],
      past: [],
      booked: events.booked
    };

    events.upcoming.concat(events.today, events.past).forEach(event => {
      const status = determineEventStatus(event.date);
      categorized[status].push(event);
    });

    setEvents(categorized);
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.title = event.title ? "" : "Title is required";
    tempErrors.description = event.description ? "" : "Description is required";
    tempErrors.location = event.location ? "" : "Location is required";
    tempErrors.maxAttendees = event.maxAttendees > 0 ? "" : "Max attendees must be greater than 0";
    
    // Date validation
    const today = startOfDay(new Date());
    const eventDate = parseISO(event.date);
    if (!event.date) {
      tempErrors.date = "Date is required";
    } else if (isBefore(eventDate, today)) {
      tempErrors.date = "Event date cannot be in the past";
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

  const addEvent = () => {
    if (validateForm()) {
      const newEvent = { ...event, id: Date.now().toString() };
      const status = determineEventStatus(newEvent.date);
      
      setEvents(prev => ({
        ...prev,
        [status]: [...prev[status], newEvent]
      }));
      
      setEvent({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
      toast.success("Event added successfully!");
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const deleteEvent = (id, status) => {
    setEvents(prev => ({
      ...prev,
      [status]: prev[status].filter(event => event.id !== id)
    }));
    toast.success("Event deleted!");
  };

  const editEvent = (id, status) => {
    setIsEditing(true);
    setEditId(id);
    const eventToEdit = events[status].find(event => event.id === id);
    setEvent(eventToEdit);
  };

  const updateEvent = () => {
    const updatedEvent = { ...event, id: editId };
    setEvents(prev => ({
      ...prev,
      upcoming: prev.upcoming.map(item => item.id === editId ? updatedEvent : item),
      today: prev.today.map(item => item.id === editId ? updatedEvent : item),
      past: prev.past.map(item => item.id === editId ? updatedEvent : item)
    }));
    setIsEditing(false);
    setEditId(null);
    setEvent({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
    toast.success("Event updated successfully!");
  };

  const reserveTicket = (id, status) => {
    if (status === 'past') {
      toast.error("Cannot book tickets for past events.");
      return;
    }

    const eventToBook = events[status].find(event => event.id === id);
    if (eventToBook) {
      setEvents(prev => {
        const existingBooking = prev.booked.find(event => event.id === id);
        if (existingBooking) {
          // If already booked, increase the ticket count
          return {
            ...prev,
            booked: prev.booked.map(event => 
              event.id === id 
                ? { ...event, ticketCount: (event.ticketCount || 1) + 1 }
                : event
            )
          };
        } else {
          // If not booked yet, add to booked events with ticket count 1
          return {
            ...prev,
            booked: [...prev.booked, { ...eventToBook, ticketCount: 1 }]
          };
        }
      });
      toast.success("Ticket reserved successfully!");
    }
  };

  const cancelReservation = (id) => {
    setEvents(prev => {
      const bookedEvent = prev.booked.find(event => event.id === id);
      if (bookedEvent.ticketCount > 1) {
        // If more than one ticket, decrease the count
        return {
          ...prev,
          booked: prev.booked.map(event => 
            event.id === id 
              ? { ...event, ticketCount: event.ticketCount - 1 }
              : event
          )
        };
      } else {
        // If only one ticket, remove from booked and add back to appropriate category
        const updatedBooked = prev.booked.filter(event => event.id !== id);
        const eventToReturn = { ...bookedEvent, ticketCount: undefined };
        const returnCategory = determineEventStatus(eventToReturn.date);
        return {
          ...prev,
          booked: updatedBooked,
          [returnCategory]: [...prev[returnCategory], eventToReturn]
        };
      }
    });
    toast.success("Reservation cancelled successfully!");
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
    const selectedDate = e.target.value;
    const today = startOfDay(new Date());
    const eventDate = parseISO(selectedDate);
    
    if (!isBefore(eventDate, today)) {
      setEvent({ ...event, date: selectedDate });
      setErrors({ ...errors, date: "" });
    } else {
      setErrors({ ...errors, date: "Event date cannot be in the past" });
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      '&:hover': {
        backgroundColor: '#333333',
      },
      '&.Mui-focused': {
        backgroundColor: '#333333',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#90caf9',
        },
      },
    },
    '& .MuiOutlinedInput-input': {
      color: '#ffffff',
      '&::placeholder': {
        color: '#999999',
        opacity: 1,
      },
    },
    '& .MuiInputLabel-root': {
      color: '#b0bec5',
      '&.Mui-focused': {
        color: '#90caf9',
      },
    },
    '& .MuiInputAdornment-root': {
      color: '#b0bec5',
    },
    '& .MuiFormHelperText-root': {
      color: '#b0bec5',
    },
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
              <div key={event.id} className="bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
                <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-gray-600">{format(parseISO(event.date), 'PPP')}</p>
                  <p className="text-gray-600">Max Attendees: {event.maxAttendees}</p>
                  <div className="flex space-x-2 mt-4">
                    {status !== 'past' && (
                      <button
                        onClick={() => reserveTicket(event.id, status)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                      >
                        Reserve Ticket
                      </button>
                    )}
                    {user.role === "admin" && (
                      <>
                        <button
                          onClick={() => editEvent(event.id, status)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id, status)}
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