import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: mode === 'test' ? {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://test.supabase.invalid'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('test-publishable-key'),
  } : undefined,
  test: {
    environment: 'jsdom',
    globals: true,
  },
}));
