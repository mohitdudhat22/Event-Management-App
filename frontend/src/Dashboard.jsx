import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import Event from './Event';
import Login from './Login';
import Registration from './Registration';
import BookedEvents from './BookedEvents';
import EventForm from './EventForm';

// Create a theme for the app
const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Component for dashboard content
function DashboardContent({ pathname }) {
  const theme = useTheme();
  
  const renderContent = () => {
    switch (pathname) {
      case '/dashboard':
      case '/dashboard/events':
        return <Event />;
      case '/dashboard/events/new':
        return <EventForm />;
      case '/dashboard/attendees':
        return <Event />;
      case '/dashboard/booked-events':
        return <BookedEvents />;
      case '/dashboard/settings':
        return <Event />;
      case '/dashboard/login':
        return <Login />;
      case '/dashboard/register':
        return <Registration />;
      default:
        return <Typography>Dashboard content for {pathname}</Typography>;
    }
  };

  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
      }}
    >
      {renderContent()}  
    </Box>
  );
}

DashboardContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutNavigationLinks(props) {
  const { window, darkMode, toggleDarkMode } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const router = React.useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => {
        navigate(`/dashboard${path}`);
      },
    };
  }, [location, navigate]);

  const demoWindow = window !== undefined ? window() : undefined;

  const navigationItems = [
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
      segment: 'events/new',
      title: 'New Event',
      icon: <AddIcon />,
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
  ];

  return (
    <AppProvider
      navigation={navigationItems}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DashboardContent pathname={location.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutNavigationLinks.propTypes = {
  window: PropTypes.func,
  darkMode: PropTypes.bool,
  toggleDarkMode: PropTypes.func,
};

export default DashboardLayoutNavigationLinks;