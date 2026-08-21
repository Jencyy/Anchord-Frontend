/**
 * Application Entry Point
 * -----------------------------------------------------------
 * Mounts the React application to the DOM's root element.
 * -----------------------------------------------------------
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css' // Import global CSS styles
import App from './App' // Import the main App component

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Render the App wrapped in StrictMode to highlight potential problems in an application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
