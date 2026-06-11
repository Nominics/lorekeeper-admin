"use client";

import React from 'react';
import { CardForm } from '@/components/admin/card-form';
import { Database, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewCardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 -ml-2 text-muted-foreground hover:text-primary">
              <Link href="/admin/cards">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Registry
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Initialize Record
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Encode a new digital entity into the archive's primary registry.
          </p>
        </div>
      </div>

      <CardForm />
    </div>
  );
}
