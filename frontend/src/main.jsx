import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { StyledEngineProvider } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { EventProvider } from './context/EventContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
        <StyledEngineProvider injectFirst>
          <EventProvider>
        <BrowserRouter>
    <App />
    </BrowserRouter>
    <Toaster position="top-center"
  reverseOrder={false}/>
        </EventProvider>
  </StyledEngineProvider>
  </StrictMode>,
)
