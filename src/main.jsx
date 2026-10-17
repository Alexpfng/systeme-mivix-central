import React from 'react';
import { createRoot } from 'react-dom/client';

export function isVisualPreview(location = window.location, environment = import.meta.env) {
  return Boolean(environment?.DEV)
    && new URLSearchParams(location.search).get('preview') === 'mivix';
}

export async function bootstrap(root, location = window.location) {
  if (isVisualPreview(location, import.meta.env)) {
    const { default: VisualShell } = await import('./app/VisualShell');
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
