import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
import { EventProvider } from './context/EventContext';
import './App.css';
import Dashboard from './Dashboard';
import Layout from './Layout';
import Login from './Login';
import Registration from './Registration';

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
                <Route path="dashboard/*" element={<Dashboard />} />
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Registration />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </EventProvider>
    </ThemeProvider>
  );
}

export default App;