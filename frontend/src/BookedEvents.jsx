import React from 'react';
import { format, parseISO } from 'date-fns';
import { useEventContext } from './context/EventContext';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, Chip, Avatar } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

function BookedEvents() {
  const { events, cancelReservation } = useEventContext();

  const placeholderImage = 'https://via.placeholder.com/400x200?text=No+Image+Available';

  return (
    <Box sx={{ flexGrow: 1, width: '100%', padding: 2 }}>
      <Typography variant="h4" gutterBottom component="h1" align="center" sx={{ mb: 4 }}>
        Your Booked Events
      </Typography>
      {events.booked.length === 0 ? (
        <Typography variant="body1" align="center">
          You haven't booked any events yet.
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {events.booked.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={event.imageUrl || placeholderImage}
                  alt={event.title}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(parseISO(event.date), 'PPP')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ConfirmationNumberIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Tickets Booked: {event.ticketCount}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Chip
                      avatar={<Avatar>{event.ticketCount}</Avatar>}
                      label="Tickets"
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={() => cancelReservation(event.id)}
                      sx={{ mt: 2 }}
                    >
                      Cancel Reservation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default BookedEvents;