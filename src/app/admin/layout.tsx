"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();

    // Listen for auth state changes (e.g., logout from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AdminSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 border-b border-border/40 flex items-center px-8 bg-card/20 backdrop-blur-sm shrink-0">
            <div className="flex-1">
              <h2 className="font-headline text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
                Administrative Terminal
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-headline font-bold text-foreground">Archivist Prime</p>
                <p className="text-[10px] font-body text-muted-foreground">Admin Status: Online</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-[10px] font-headline font-bold text-primary">AP</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background p-8 custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
