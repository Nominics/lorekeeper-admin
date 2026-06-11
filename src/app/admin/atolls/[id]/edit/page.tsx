
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AtollForm } from '@/components/admin/atoll-form';
import { Map, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function EditAtollPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [atoll, setAtoll] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAtoll() {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('atolls')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Atoll node not found.');
        
        setAtoll(data);
      } catch (err: any) {
        console.error('Error fetching atoll:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAtoll();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Geography...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Registry Failure</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/admin/atolls">
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
              <Link href="/admin/atolls">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Registry
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Map className="w-8 h-8 text-primary" />
            Modify Atoll
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Updating geographical record: <span className="text-primary font-mono">{atoll.code}</span>
          </p>
        </div>
      </div>

      <AtollForm initialData={atoll} isEdit={true} />
    </div>
  );
}
