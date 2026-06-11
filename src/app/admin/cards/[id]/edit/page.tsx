"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CardForm } from '@/components/admin/card-form';
import { Database, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function EditCardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCard() {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('cards')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Entity not found in archival node.');
        
        setCard(data);
      } catch (err: any) {
        console.error('Error fetching card:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
          Retrieving Archival Node...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Access Failure</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/admin/cards">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registry
          </Link>
        </Button>
      </div>
    );
  }

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
            Modify Record
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Updating archival node: <span className="text-primary font-mono">{id}</span>
          </p>
        </div>
      </div>

      <CardForm initialData={card} isEdit={true} />
    </div>
  );
}
