import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabaseConfig';

const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig(import.meta.env);

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
