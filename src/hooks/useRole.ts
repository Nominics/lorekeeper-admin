"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export type AdminRole = 'superadmin' | 'admin' | 'moderator';

export function useRole() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        
        setRole(data?.role as AdminRole);
      } catch (err: any) {
        console.error('Error fetching role:', err);
        setError(err.message);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading, error };
}
