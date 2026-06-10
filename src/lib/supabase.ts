import { supabase } from './supabase/client';

/**
 * Re-exporting the centralized Supabase client to maintain backward compatibility
 * while consolidating configuration in the lib/supabase/client.ts file.
 */
export { supabase };
