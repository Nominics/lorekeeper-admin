
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  Compass, 
  Sparkles, 
  CalendarDays, 
  Activity, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DashboardStats {
  cards: { total: number; enabled: number };
  players: { total: number };
  expeditions: { total: number; active: number };
  discoveries: { total: number };
  events: { active: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const now = new Date().toISOString();

        const [
          cardsRes,
          enabledCardsRes,
          playersRes,
          expeditionsRes,
          activeExpeditionsRes,
          discoveriesRes,
          activeEventsRes
        ] = await Promise.all([
          supabase.from('cards').select('*', { count: 'exact', head: true }),
          supabase.from('cards').select('*', { count: 'exact', head: true }).eq('enabled', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('expeditions').select('*', { count: 'exact', head: true }),
          supabase.from('expeditions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('discoveries').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
        ]);

        // Handle potential query errors (some tables might not exist yet in the user's Supabase)
        // If a table is missing, Supabase might return an error. We default to 0 for missing data.
        
        setStats({
          cards: { 
            total: cardsRes.count || 0, 
            enabled: enabledCardsRes.count || 0 
          },
          players: { 
            total: playersRes.count || 0 
          },
          expeditions: { 
            total: expeditionsRes.count || 0, 
            active: activeExpeditionsRes.count || 0 
          },
          discoveries: { 
            total: discoveriesRes.count || 0 
          },
          events: { 
            active: activeEventsRes.count || 0 
          }
        });
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to synchronize with the digital archive. Some modules may be offline.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
            Querying Registry Nodes...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Archive Cards", 
      value: stats?.cards.total ?? 0, 
      sub: `${stats?.cards.enabled ?? 0} active in deck`, 
      icon: BookOpen 
    },
    { 
      title: "Registered Players", 
      value: stats?.players.total ?? 0, 
      sub: "Across all realms", 
      icon: Users 
    },
    { 
      title: "Expeditions", 
      value: stats?.expeditions.total ?? 0, 
      sub: `${stats?.expeditions.active ?? 0} currently active`, 
      icon: Compass 
    },
    { 
      title: "Active Events", 
      value: stats?.events.active ?? 0, 
      sub: "Ongoing chronicles", 
      icon: CalendarDays 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground">
          Registry Overview
        </h1>
        <p className="text-muted-foreground font-body">
          Real-time status of the digital archive and protagonist activities.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Synchronization Error</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/60 bg-card/50 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-headline font-bold">{stat.value}</div>
              <p className="text-[10px] font-body text-muted-foreground mt-1 italic uppercase tracking-wider">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/60 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <CardTitle className="font-headline text-lg">Discovery Registry</CardTitle>
            </div>
            <CardDescription className="font-body">Total discoveries cataloged: <span className="text-foreground font-bold">{stats?.discoveries.total ?? 0}</span></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-8 border border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center text-center gap-4">
                <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-headline font-medium text-muted-foreground">Historical records stable.</p>
                  <p className="text-xs text-muted-foreground/60 font-body italic mt-1">Detailed activity log module pending initialization.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/30">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Archive Integrity</CardTitle>
            <CardDescription className="font-body">System resource health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline uppercase tracking-wider">
                <span>Database Connectivity</span>
                <span className={error ? "text-rose-500" : "text-emerald-500"}>{error ? "Interrupted" : "Optimal"}</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${error ? "bg-rose-500 w-[20%]" : "bg-emerald-500 w-full"}`} />
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-border/40">
              <div className="p-4 rounded-sm bg-primary/5 border border-primary/20">
                <p className="text-[10px] font-headline uppercase tracking-widest text-primary mb-1">Administrative Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed font-body italic">
                  Clearance levels are enforced across all registry nodes. Dashboard metrics are refreshed on session initialization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
