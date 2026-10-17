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

test.each(['http://example.supabase.co', 'not-a-url'])(
  'rejects an invalid HTTPS URL: %s',
  (url) => {
    expect(() => getSupabaseConfig({
      VITE_SUPABASE_URL: url,
      VITE_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    })).toThrow('VITE_SUPABASE_URL must be a valid HTTPS URL');
  },
);

test('rejects whitespace-only configuration values', () => {
  expect(() => getSupabaseConfig({
    VITE_SUPABASE_URL: '   ',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  })).toThrow('VITE_SUPABASE_URL must be configured');

  expect(() => getSupabaseConfig({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: '   ',
  })).toThrow('VITE_SUPABASE_PUBLISHABLE_KEY must be configured');
});

test('returns trimmed values for valid configuration', () => {
  expect(getSupabaseConfig({
    VITE_SUPABASE_URL: ' https://example.supabase.co ',
    VITE_SUPABASE_PUBLISHABLE_KEY: ' test-publishable-key ',
  })).toEqual({
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'test-publishable-key',
  });
});
