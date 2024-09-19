import PropTypes from 'prop-types';
import { Box, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardLayoutNavigationLinks from './Dashboard';
import { useEventContext } from './context/EventContext';

function Layout({ toggleDarkMode, darkMode, children }) {
  const { user } = useEventContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Event Manager
          </Typography>
          <IconButton onClick={toggleDarkMode} color="inherit" size="small">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <DashboardLayoutNavigationLinks user={user} />
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

Layout.propTypes = {
  toggleDarkMode: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

export default Layout;