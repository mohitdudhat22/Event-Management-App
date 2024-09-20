import { format } from 'date-fns';
import { Box, TextField, Button, Grid, InputAdornment, Typography, Paper, Container } from '@mui/material';
import { inputStyle } from "./config";
import { useEventContext } from "./context/EventContext.jsx";

function EventForm() {
   const { event, setEvent, errors, handleSubmit, handleDateChange, isEditing } = useEventContext();
  return (
    <Box>
      <Container maxWidth={false}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            {isEditing ? "Edit Event" : "Create New Event"}
          </Typography>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { my: 1.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxWidth: '600px',
              width: '100%',
            }}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
            disableGutters
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
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={12}>
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

            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default EventForm;