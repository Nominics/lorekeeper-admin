
"use client";

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
