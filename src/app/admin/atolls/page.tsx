"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Map,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { format } from 'date-fns';

interface AtollData {
  id: string;
  code: string;
  admin_name: string;
  traditional_name: string;
  display_order: number;
  enabled: boolean;
  created_at: string;
}

export default function AtollsListPage() {
  const [atolls, setAtolls] = useState<AtollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAtolls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('atolls')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setAtolls(data || []);
    } catch (err: any) {
      console.error('Error fetching atolls:', err);
      setError(err.message || 'Failed to retrieve atoll data from the archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAtolls();
  }, [fetchAtolls]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Map className="w-8 h-8 text-primary" />
            Atoll Registry
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Manage the geographical nodes of the digital realm.
          </p>
        </div>
        <Button asChild className="font-headline font-bold">
          <Link href="/admin/atolls/new">
            <Plus className="w-4 h-4 mr-2" />
            Define New Atoll
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Registry Error</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border border-border/60 bg-card/20 overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
              Retrieving Geography...
            </p>
          </div>
        ) : atolls.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
            <Map className="w-10 h-10 text-muted-foreground/20" />
            <p className="font-headline text-lg font-medium text-muted-foreground">No atolls cataloged</p>
            <p className="text-xs text-muted-foreground/60 font-body italic">Initialize a new atoll to begin geographical mapping.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Code</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Admin Name</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Traditional</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Order</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px] text-center">Status</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Cataloged At</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atolls.map((atoll) => (
                <TableRow key={atoll.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-primary">{atoll.code}</TableCell>
                  <TableCell className="font-headline font-bold text-sm tracking-tight">{atoll.admin_name}</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{atoll.traditional_name || '—'}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{atoll.display_order}</TableCell>
                  <TableCell className="text-center">
                    {atoll.enabled ? (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/5">
                        <Eye className="w-3 h-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-rose-500/50 text-rose-500 bg-rose-500/5">
                        <EyeOff className="w-3 h-3 mr-1" /> Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {format(new Date(atoll.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 hover:bg-primary hover:text-primary-foreground">
                      <Link href={`/admin/atolls/${atoll.id}/edit`}>
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        Modify
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <p className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground italic">
          Total geographical nodes: <span className="text-foreground font-bold">{atolls.length}</span>
        </p>
      </div>
    </div>
  );
}