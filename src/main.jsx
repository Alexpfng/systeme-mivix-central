import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthProvider';
import LoginPage from './auth/LoginPage';
import App, { VisualShell } from './app/App';

const isVisualPreview = import.meta.env.DEV
  && new URLSearchParams(window.location.search).get('preview') === 'mivix';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isVisualPreview ? <VisualShell /> : <AuthProvider><LoginPage /></AuthProvider>}
  </React.StrictMode>,
);
