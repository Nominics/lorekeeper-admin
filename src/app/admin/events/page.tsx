
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Calendar,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Gift
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { format } from 'date-fns';

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  popup_enabled: boolean;
  reward_type: string;
  theme_color: string;
}

export default function EventsListPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('events').select('*');

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error: fetchError } = await query.order('start_date', { ascending: false });

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to retrieve event data from the archive.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const getRewardBadge = (type: string) => {
    switch (type) {
      case 'card': return <Badge variant="outline" className="border-primary/50 text-primary">Card</Badge>;
      case 'cowry': return <Badge variant="outline" className="border-amber-500/50 text-amber-500">Cowry</Badge>;
      case 'title': return <Badge variant="outline" className="border-blue-500/50 text-blue-500">Title</Badge>;
      case 'badge': return <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">Badge</Badge>;
      default: return <Badge variant="secondary">None</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Chronicle Registry
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Manage time-limited events and narrative milestones.
          </p>
        </div>
        <Button asChild className="font-headline font-bold">
          <Link href="/admin/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Initialize New Event
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

      <Card className="border-border/60 bg-card/30">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/60 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border border-border/60 bg-card/20 overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
              Retrieving Chronicles...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground/20" />
            <p className="font-headline text-lg font-medium text-muted-foreground">No events cataloged</p>
            <p className="text-xs text-muted-foreground/60 font-body italic">Initialize a new event to begin a chronicle.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Title</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Timeline</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Reward</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px] text-center">Active</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px] text-center">Popup</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-headline font-bold text-sm tracking-tight">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.theme_color }} />
                      {event.title}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.start_date), 'MMM d, yyyy')} — {format(new Date(event.end_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{getRewardBadge(event.reward_type)}</TableCell>
                  <TableCell className="text-center">
                    {event.is_active ? (
                      <Eye className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-rose-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {event.popup_enabled ? (
                      <Bell className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 hover:bg-primary hover:text-primary-foreground">
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
