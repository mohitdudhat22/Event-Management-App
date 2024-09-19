import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { format, isBefore, isAfter, parseISO, isToday } from "date-fns";
import TextField from '@mui/material/TextField'; // Add this import
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Box } from "@mui/material";
import Grid from '@mui/material/Grid'; // Add this import at the top of the file
import InputAdornment from '@mui/material/InputAdornment';

// Add this styled component for the visually hidden input
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
  const [events, setEvents] = useState({ upcoming: [], today: [], past: [] });
  const [event, setEvent] = useState({ title: "", description: "", date: "", location: "", maxAttendees: "", imageUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState({ name: "John Doe", role: "admin" }); // Example user data

  useEffect(() => {
    categorizeEvents();
  }, [events]);

  const categorizeEvents = () => {
    const now = new Date();
    const upcoming = [];
    const today = [];
    const past = [];

    events.upcoming.concat(events.today, events.past).forEach(event => {
      const eventDate = parseISO(event.date);
      if (isBefore(eventDate, now) && !isToday(eventDate)) {
        past.push(event);
      } else if (isAfter(eventDate, now) && !isToday(eventDate)) {
        upcoming.push(event);
      } else if (isToday(eventDate)) {
        today.push(event);
      }
    });

    setEvents({ upcoming, today, past });
  };

  const addEvent = () => {
    if (event.title.trim() === "") return;

    const newEvent = { ...event, id: Date.now().toString() };
    setEvents(prev => ({
      ...prev,
      upcoming: [...prev.upcoming, newEvent]
    }));
    setEvent({ title: "", description: "", date: "", location: "", maxAttendees: 0, imageUrl: "" });
    toast.success("Event added successfully!");
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
    setEvent({ title: "", description: "", date: "", location: "", maxAttendees: 0, imageUrl: "" });
    toast.success("Event updated successfully!");
  };

  const reserveTicket = (id, status) => {
    toast.success("Ticket reserved successfully!");
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
       >
        <form onSubmit={(e) => e.preventDefault()} className="mb-8 flex flex-col gap-4">
          <TextField
            label="Event Title"
            variant="outlined"
            size="small"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            fullWidth
            sx={inputStyle}
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
          />
          <TextField
            label="Event Date"
            variant="outlined"
            size="small"
            type="date"
            value={event.date}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={inputStyle}
          />
          <TextField
            label="Event Location"
            variant="outlined"
            size="small"
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            fullWidth
            sx={inputStyle}
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
          <button
            type="button"
            onClick={isEditing ? updateEvent : addEvent}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition duration-300 ease-in-out min-w-[100px]"
          >
            {isEditing ? "Update" : "Add"}
          </button>
        </form>
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
                    <button
                      onClick={() => reserveTicket(event.id, status)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                    >
                      Reserve Ticket
                    </button>
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
      </div>
    </div>
  );
}

export default Event;