import { Box, TextField, Button, Typography, Paper, Container, Avatar } from '@mui/material';
import { useState, useEffect } from 'react';
import { useEventContext } from './context/EventContext';
import { useNavigate } from 'react-router-dom';

function EventForm() {
  const { event, setEvent, errors, handleSubmit, isEditing } = useEventContext();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (event.image) {
      setImagePreview(event.image);
    }
  }, [event.image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const navigate = useNavigate();
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', event.title);
    formData.append('description', event.description);
    formData.append('date', event.date);
    formData.append('location', event.location);
    formData.append('maxAttendees', event.maxAttendees);
    formData.append('status', event.status || 'upcoming');
    if (imageFile) {
      formData.append('image', imageFile);
    }
    await handleSubmit(formData);
    navigate('/dashboard/events');
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    setEvent({ ...event, date: inputDate });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? "Edit Event" : "Create New Event"}
        </Typography>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <TextField
            label="Event Title"
            variant="outlined"
            value={event.title || ''}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            label="Event Description"
            variant="outlined"
            value={event.description || ''}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            label="Event Date"
            variant="outlined"
            type="date"
            value={event.date || ''}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!errors.date}
            helperText={errors.date}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
          />
          <TextField
            label="Event Location"
            variant="outlined"
            value={event.location || ''}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            fullWidth
            error={!!errors.location}
            helperText={errors.location}
          />
          <TextField
            label="Max Attendees"
            variant="outlined"
            type="number"
            value={event.maxAttendees || ''}
            onChange={(e) => setEvent({ ...event, maxAttendees: e.target.value })}
            fullWidth
            error={!!errors.maxAttendees}
            helperText={errors.maxAttendees}
          />

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button variant="outlined" component="span" sx={{ mt: 2 }}>
              Upload Event Image
            </Button>
          </label>

          {imagePreview && <Avatar src={imagePreview} alt="Event Preview" sx={{ width: 100, height: 100, mt: 2 }} />}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            {isEditing ? "Update Event" : "Create Event"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default EventForm;