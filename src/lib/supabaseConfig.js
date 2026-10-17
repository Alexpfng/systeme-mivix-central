export function getSupabaseConfig(env) {
  const supabaseUrl = env?.VITE_SUPABASE_URL?.trim();
  const supabasePublishableKey = env?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL must be configured before creating the Supabase client');
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== 'https:') throw new Error('not https');
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL before creating the Supabase client');
  }

  if (!supabasePublishableKey) {
    throw new Error(
      'VITE_SUPABASE_PUBLISHABLE_KEY must be configured before creating the Supabase client',
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}
