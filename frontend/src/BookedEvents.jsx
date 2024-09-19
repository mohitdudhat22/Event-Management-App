import React from 'react';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';

function BookedEvents({ bookedEvents, cancelReservation }) {
    return (
      <div className="flex-1 p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 capitalize text-gray-700">Booked Events</h2>
        {bookedEvents.map((event) => (
          <div key={event.id} className="bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{event.title}</h3>
              <p className="text-gray-600">{format(parseISO(event.date), 'PPP')}</p>
              <p className="text-gray-600">Max Attendees: {event.maxAttendees}</p>
              <p className="text-gray-600">Tickets Booked: {event.ticketCount}</p>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => cancelReservation(event.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
BookedEvents.propTypes = {
    bookedEvents: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        maxAttendees: PropTypes.number.isRequired,
        ticketCount: PropTypes.number.isRequired,
        imageUrl: PropTypes.string.isRequired,
    })).isRequired,
    cancelReservation: PropTypes.func.isRequired,
};


export default BookedEvents;