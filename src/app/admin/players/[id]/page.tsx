
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  User, 
  BookOpen, 
  Compass, 
  Sparkles,
  Coins,
  Ship,
  Shield,
  Calendar,
  MapPin,
  Trophy,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { format } from 'date-fns';

interface ProfileData {
  id: string;
  username: string;
  role: string;
  home_atoll: string;
  cowry_shells: number;
  boat_level: number;
  lore_score: number;
  collection_power: number;
  completion_percent: number;
  created_at: string;
}

interface PlayerCard {
  card_id: string;
  quantity: number;
  merge_level: number;
  is_holographic: boolean;
  cards: {
    card_name: string;
    rarity: string;
    class: string;
    atoll: string;
  };
}

interface Expedition {
  id: string;
  expedition_type: string;
  destination_atoll: string;
  status: string;
  start_time: string;
  end_time: string;
  cowry_reward: number;
}

interface Discovery {
  id: string;
  card_id: string;
  discovered_at: string;
  is_holographic: boolean;
  cards: {
    card_name: string;
  };
}

export default function PlayerDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [collection, setCollection] = useState<PlayerCard[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      const [profileRes, collectionRes, expeditionsRes, discoveriesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('player_cards').select('*, cards(card_name, rarity, class, atoll)').eq('player_id', id),
        supabase.from('expeditions').select('*').eq('player_id', id).order('start_time', { ascending: false }),
        supabase.from('discoveries').select('*, cards(card_name)').eq('player_id', id).order('discovered_at', { ascending: false })
      ]);

      if (profileRes.error) throw profileRes.error;
      
      setProfile(profileRes.data);
      setCollection(collectionRes.data || []);
      setExpeditions(expeditionsRes.data || []);
      setDiscoveries(discoveriesRes.data || []);
    } catch (err: any) {
      console.error('Error fetching player details:', err);
      setError(err.message || 'Failed to retrieve deep archival data for this protagonist.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Protagonist Archive...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Access Failure</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error || 'Archival node for this entity is unreachable.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/admin/players">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
        </Button>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-slate-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" asChild className="h-6 px-0 text-muted-foreground hover:text-primary">
                <Link href="/admin/players" className="text-[10px] font-headline uppercase tracking-widest flex items-center">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Directory
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
              {profile.username}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="text-[9px] font-headline uppercase tracking-widest">
                {profile.role}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" /> {profile.id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex items-center gap-4">
          <div className="bg-card/30 border border-border/40 rounded-lg p-3 flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground">Cowry Shells</p>
              <p className="text-lg font-mono font-bold leading-none">{profile.cowry_shells.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-card/30 border border-border/40 rounded-lg p-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground">Lore Score</p>
              <p className="text-lg font-mono font-bold leading-none">{profile.lore_score.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-card/40 border border-border/40 p-1">
          <TabsTrigger value="overview" className="font-headline text-xs uppercase tracking-widest py-2 px-6">Overview</TabsTrigger>
          <TabsTrigger value="collection" className="font-headline text-xs uppercase tracking-widest py-2 px-6">Collection ({collection.length})</TabsTrigger>
          <TabsTrigger value="expeditions" className="font-headline text-xs uppercase tracking-widest py-2 px-6">Expeditions ({expeditions.length})</TabsTrigger>
          <TabsTrigger value="discoveries" className="font-headline text-xs uppercase tracking-widest py-2 px-6">Discoveries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60 bg-card/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Core Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Home Atoll</span>
                  <span className="text-xs font-mono font-bold text-primary">{profile.home_atoll}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Boat Level</span>
                  <span className="text-xs font-mono font-bold">{profile.boat_level}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Joined At</span>
                  <span className="text-xs font-mono">{format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Collection Power</span>
                  <span className="text-xs font-mono font-bold">{profile.collection_power.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/30 md:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Archive Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full justify-center gap-8 pb-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-headline font-bold">Total Completion</span>
                    <span className="text-3xl font-mono font-bold text-primary">{profile.completion_percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/40">
                    <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(230,184,26,0.3)]" style={{ width: `${profile.completion_percent}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-background/40 border border-border/20 text-center">
                    <p className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground mb-1">Total Cards</p>
                    <p className="text-2xl font-mono font-bold">{collection.length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/40 border border-border/20 text-center">
                    <p className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground mb-1">Discoveries</p>
                    <p className="text-2xl font-mono font-bold">{discoveries.length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/40 border border-border/20 text-center">
                    <p className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground mb-1">Expeditions</p>
                    <p className="text-2xl font-mono font-bold">{expeditions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collection" className="animate-in fade-in duration-300">
          <div className="rounded-md border border-border/60 bg-card/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Card Name</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Rarity</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Class</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Atoll</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Quantity</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Merge Lvl</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Prismatic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic font-body text-xs">
                      This protagonist has not yet acquired any archival entities.
                    </TableCell>
                  </TableRow>
                ) : (
                  collection.map((item) => (
                    <TableRow key={item.card_id} className="border-border/40 hover:bg-primary/5 transition-colors">
                      <TableCell className="font-headline font-bold text-sm tracking-tight">
                        {item.cards?.card_name}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-headline font-bold uppercase ${getRarityColor(item.cards?.rarity)}`}>
                          {item.cards?.rarity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-headline py-0">{item.cards?.class}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{item.cards?.atoll}</TableCell>
                      <TableCell className="font-mono text-sm font-bold">{item.quantity}x</TableCell>
                      <TableCell className="font-mono text-xs">{item.merge_level}</TableCell>
                      <TableCell>
                        {item.is_holographic && (
                          <div className="flex items-center gap-1.5 text-primary">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-headline uppercase tracking-wider font-bold">Holo</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="expeditions" className="animate-in fade-in duration-300">
          <div className="rounded-md border border-border/60 bg-card/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Type</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Destination</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Status</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Timeline</TableHead>
                  <TableHead className="font-headline uppercase tracking-widest text-[10px]">Shell Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expeditions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic font-body text-xs">
                      No expedition logs found in the archives for this protagonist.
                    </TableCell>
                  </TableRow>
                ) : (
                  expeditions.map((exp) => (
                    <TableRow key={exp.id} className="border-border/40 hover:bg-primary/5 transition-colors">
                      <TableCell className="font-headline font-bold text-xs uppercase tracking-wider">{exp.expedition_type}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">{exp.destination_atoll}</TableCell>
                      <TableCell>
                        <Badge variant={exp.status === 'completed' ? 'outline' : 'secondary'} className={`text-[9px] font-headline ${exp.status === 'completed' ? 'border-emerald-500/50 text-emerald-500' : ''}`}>
                          {exp.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {format(new Date(exp.start_time), 'MMM d, HH:mm')} — {exp.status === 'completed' ? format(new Date(exp.end_time), 'HH:mm') : 'Ongoing'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-amber-500">+{exp.cowry_reward.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="discoveries" className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveries.length === 0 ? (
              <div className="col-span-full h-32 flex items-center justify-center border border-dashed border-border/40 rounded-lg text-muted-foreground italic font-body text-xs">
                No new archival entities discovered yet.
              </div>
            ) : (
              discoveries.map((discovery) => (
                <div key={discovery.id} className="p-4 rounded-lg bg-card/30 border border-border/40 flex items-center justify-between group hover:border-primary/40 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-headline font-bold text-sm">{discovery.cards?.card_name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">Cataloged {format(new Date(discovery.discovered_at), 'MMM d, yyyy')}</span>
                  </div>
                  {discovery.is_holographic && (
                    <Sparkles className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
