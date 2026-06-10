import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration using environment variables.
 * These must be defined in the project's .env files.
 * Fallback values are provided to prevent runtime crashes during initial setup.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Authentication features will not work until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
