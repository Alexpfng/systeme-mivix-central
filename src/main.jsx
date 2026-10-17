import React from 'react';
import { createRoot } from 'react-dom/client';
import VisualShell from './app/VisualShell';

export function isVisualPreview(location = window.location) {
  return new URLSearchParams(location.search).get('preview') === 'mivix';
}

export async function bootstrap(root, location = window.location) {
  if (isVisualPreview(location)) {
    createRoot(root).render(
      <React.StrictMode>
        <VisualShell />
      </React.StrictMode>,
    );
    return;
  }

  const [{ AuthProvider }, { default: LoginPage }] = await Promise.all([
    import('./auth/AuthProvider'),
    import('./auth/LoginPage'),
  ]);

  createRoot(root).render(
    <React.StrictMode>
      <AuthProvider><LoginPage /></AuthProvider>
    </React.StrictMode>,
  );
}

const root = document.getElementById('root');
if (root) bootstrap(root);
