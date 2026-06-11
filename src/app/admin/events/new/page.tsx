
"use client";

import React from 'react';
import { EventForm } from '@/components/admin/event-form';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewEventPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 -ml-2 text-muted-foreground hover:text-primary">
              <Link href="/admin/events">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Chronicles
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Initialize Chronicle
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Define a new time-limited narrative event for the protagonists.
          </p>
        </div>
      </div>

      <EventForm />
    </div>
  );
}
