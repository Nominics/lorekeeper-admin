import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration using environment variables.
 * Fallback values provided by the user to ensure the application 
 * initializes correctly in the current environment.
 */
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pqtfuvyenvwkegzchwyd.supabase.co').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdGZ1dnllbnd2a2VnemNod3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTYyNjQsImV4cCI6MjA5NjY3MjI2NH0._hAuT5jwWNrQNr9f-9lno5zE44ud0lszEEa7A1cWU78').trim();

/**
 * Create a single supabase client for interacting with your database
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
