import { getSupabaseConfig } from '../../src/lib/supabaseConfig';

test.each([
  ['VITE_SUPABASE_URL', '', 'test-publishable-key'],
  ['VITE_SUPABASE_PUBLISHABLE_KEY', 'https://example.supabase.co', ''],
])('rejects invalid %s before creating the client', (variable, url, key) => {
  expect(() => getSupabaseConfig({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: key,
  })).toThrow(
    `${variable} must be configured before creating the Supabase client`,
  );
});
