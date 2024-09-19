import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
import { EventProvider } from './context/EventContext';
import './App.css';
import Login from './Login';
import Registration from './Registration';
import Event from './Event';
import Layout from './Layout';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <EventProvider>
        <BrowserRouter>
          <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="register" element={<Registration />} />
              <Route path="dashboard" element={<Event />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </EventProvider>
    </ThemeProvider>
  );
}

export default App;