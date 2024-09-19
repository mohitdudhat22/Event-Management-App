import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';

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

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutNavigationLinks(props) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/home');

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
  
    navigation={[
      {
        segment: 'home',
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
        segment: 'booked Events',
        title: 'Booked Events',
        icon: <BookmarkIcon />,
      },


      {
        segment: 'settings',
        title: 'Settings',
        icon: <SettingsIcon />,
      },
    ]}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutNavigationLinks.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutNavigationLinks;