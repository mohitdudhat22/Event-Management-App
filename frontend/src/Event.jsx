import { Box, Container, Grid, Typography, Card, CardMedia, CardContent, CardActions, Button, Chip, Avatar } from "@mui/material";
import { EventAvailable, PeopleAlt, Edit, Delete, CalendarToday, AccessTime, LocationOn } from "@mui/icons-material";
import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useEventContext } from "./context/EventContext";

function Event() {
  const { 
    events, 
    fetchEvents,
    getUserTickets,
    deleteEvent,
    reserveTicket,
    editEvent,
  } = useEventContext();

  useEffect(() => {
    fetchEvents();
    getUserTickets();
  }, []);

  const placeholderImage = 'https://via.placeholder.com/400x200?text=No+Image+Available';
  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4 }}>
      <Grid container spacing={3} direction="column">
        {['upcoming', 'today', 'past'].map((status, index) => (
          <Grid item xs={12} key={status}>
            <Box sx={{ 
              bgcolor: ['#1e3a5f', '#1e4a3f', '#4a3c2e'][index], 
              borderRadius: 2, 
              p: 3, 
              mb: 3 
            }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ textTransform: 'capitalize', fontWeight: 'bold', mb: 3, color: 'white' }}>
                {status} Events
              </Typography>
              {events[status].length > 0 ? (
                <Grid container spacing={3}>
                  {events[status].map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                      <Card sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        boxShadow: 3, 
                        borderRadius: 2,
                        transition: '0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                        },
                      }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={event.imageUrl && event.imageUrl !== "" 
                            ? event.imageUrl 
                            : placeholderImage}
                          alt={event.title}
                          sx={{
                            objectFit: 'cover',
                            bgcolor: ['#1e3a5f', '#1e4a3f', '#4a3c2e'][index],
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {event.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {format(parseISO(event.date), 'PPP')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {format(parseISO(event.date), 'p')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.location || 'TBA'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleAlt sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Max Attendees: {event.maxAttendees}
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Box>
                            {status !== 'past' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => reserveTicket(event._id, status)}
                                startIcon={<EventAvailable />}
                              >
                                Reserve
                              </Button>
                            )}
                          </Box>
                          <Box>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => editEvent(event._id, status)}
                              startIcon={<Edit />}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => deleteEvent(event._id, status)}
                              startIcon={<Delete />}
                            >
                              Delete
                            </Button>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
                  No {status} events available at the moment.
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Event;