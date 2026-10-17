import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthProvider';
import LoginPage from './auth/LoginPage';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  </React.StrictMode>,
);
