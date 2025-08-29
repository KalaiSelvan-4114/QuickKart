import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { warmupBackend } from './api/axiosClient';

// Warm up the backend on app load to reduce first-call timeouts after backgrounding
warmupBackend();

// Warm backend on visibility/focus changes to mitigate cold start after backgrounding
const warmOnVisibilityOrFocus = () => {
  if (document.visibilityState === 'visible') {
    warmupBackend();
  }
};

window.addEventListener('focus', warmOnVisibilityOrFocus);
document.addEventListener('visibilitychange', warmOnVisibilityOrFocus);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);