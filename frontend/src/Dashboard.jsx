import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import * as React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { demoTheme } from './config';
import Event from './Event.jsx';
import Login from './Login.jsx';
import Registration from './Registration.jsx';
import BookedEvents from './BookedEvents.jsx';
import EventForm from './EventForm.jsx';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const router = React.useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => navigate(path),
    };
  }, [location, navigate]);

  return (
    <AppProvider
      title="Dashboard"
      navigation={[
        {
          segment: '',
          title: 'Dashboard',
          icon: <HomeIcon />,
        },
        {
          segment: 'events',
          title: 'Events',
          icon: <EventIcon />,
        },
        {
          segment: 'attendees',
          title: 'Attendees',
          icon: <PeopleIcon />,
        },
        {
          segment: 'booked-events',
          title: 'Booked Events',
          icon: <BookmarkIcon />,
        },
        {
          segment: 'settings',
          title: 'Settings',
          icon: <SettingsIcon />,
        },
        {
          segment: 'login',
          title: 'Login',
          icon: <LoginIcon />,
        },
        {
          segment: 'register',
          title: 'Register',
          icon: <PersonAddIcon />,
        },
        {
          segment: 'events/new',
          title: 'New Event',
          icon: <AddIcon />,
        },
      ]}
      router={router}
      theme={demoTheme}
    >
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Event />} />
          <Route path="events" element={<Event />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="attendees" element={<Event />} />
          <Route path="booked-events" element={<BookedEvents />} />
          <Route path="settings" element={<Event />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Registration />} />
        </Routes>
      </DashboardLayout>
    </AppProvider>
  );
}

export default Dashboard;