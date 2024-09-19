// src/context/EventContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export function useEventContext() {
  return useContext(EventContext);
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState({ upcoming: [], today: [], past: [] });
  const [user, setUser] = useState({ name: "John Doe", role: "admin" });

  useEffect(() => {
    // You can add any initial data fetching here
    // For example, fetching data from an API
  }, []);

  const addEvent = (newEvent) => {
    setEvents(prev => ({
      ...prev,
      upcoming: [...prev.upcoming, newEvent]
    }));
  };

  const deleteEvent = (id, status) => {
    setEvents(prev => ({
      ...prev,
      [status]: prev[status].filter(event => event.id !== id)
    }));
  };

  const updateEvent = (updatedEvent, status) => {
    setEvents(prev => ({
      ...prev,
      [status]: prev[status].map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    }));
  };

  const value = {
    events,
    setEvents,
    user,
    setUser,
    addEvent,
    deleteEvent,
    updateEvent
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}