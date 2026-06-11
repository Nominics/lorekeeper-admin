
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Search, 
  FilterX, 
  Loader2, 
  AlertCircle, 
  ChevronRight,
  Shield,
  MapPin,
  Coins,
  Ship,
  History
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { format } from 'date-fns';

interface PlayerProfile {
  id: string;
  username: string;
  home_atoll: string;
  cowry_shells: number;
  boat_level: number;
  lore_score: number;
  collection_power: number;
  completion_percent: number;
  role: string;
  created_at: string;
}

interface Atoll {
  code: string;
  admin_name: string;
}

export default function PlayersListPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [atolls, setAtolls] = useState<Atoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [atollFilter, setAtollFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active atolls for filter
      const { data: atollsData } = await supabase
        .from('atolls')
        .select('code, admin_name')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      
      setAtolls(atollsData || []);

      let query = supabase.from('profiles').select('*');

      if (search) {
        query = query.ilike('username', `%${search}%`);
      }
      
      if (roleFilter !== "all") {
        query = query.eq('role', roleFilter);
      }
      
      if (atollFilter !== "all") {
        query = query.eq('home_atoll', atollFilter);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      setError(err.message || 'Failed to retrieve protagonist data from the archive.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, atollFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setAtollFilter("all");
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'superadmin': return <Badge className="bg-primary text-primary-foreground font-headline text-[9px]">SUPERADMIN</Badge>;
      case 'admin': return <Badge variant="outline" className="border-primary/50 text-primary font-headline text-[9px]">ADMIN</Badge>;
      case 'moderator': return <Badge variant="secondary" className="font-headline text-[9px]">MODERATOR</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground font-headline text-[9px] border-border/60">PLAYER</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Protagonist Directory
        </h1>
        <p className="text-muted-foreground font-body">
          Monitor and manage all entities navigating the digital chronicles.
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 border-border/60 focus:ring-primary"
              />
            </div>

            <Select value={atollFilter} onValueChange={setAtollFilter}>
              <SelectTrigger className="bg-background/50 border-border/60">
                <SelectValue placeholder="Origin Atoll" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Atolls</SelectItem>
                {atolls.map(a => <SelectItem key={a.code} value={a.code}>{a.admin_name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-background/50 border-border/60 flex-1">
                  <SelectValue placeholder="Clearance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Clearance</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetFilters}
                className="border-border/60 hover:bg-primary/10 hover:text-primary shrink-0"
              >
                <FilterX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border border-border/60 bg-card/20 overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
              Querying Protagonists...
            </p>
          </div>
        ) : players.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
            <Users className="w-10 h-10 text-muted-foreground/20" />
            <p className="font-headline text-lg font-medium text-muted-foreground">No entities found</p>
            <p className="text-xs text-muted-foreground/60 font-body italic">Adjust your query filters or wait for new arrivals.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Username</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Atoll</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Shells</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Boat</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Power</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Archive %</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Clearance</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-headline font-bold text-sm tracking-tight">{player.username}</TableCell>
                  <TableCell className="font-mono text-xs text-primary">{player.home_atoll}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Coins className="w-3 h-3 text-amber-500" />
                      {player.cowry_shells.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Ship className="w-3 h-3 text-blue-400" />
                      Lvl {player.boat_level}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold">{player.collection_power.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[40px]">
                        <div className="h-full bg-primary" style={{ width: `${player.completion_percent}%` }} />
                      </div>
                      <span className="font-mono text-[10px]">{player.completion_percent.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(player.role)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 hover:bg-primary hover:text-primary-foreground">
                      <Link href={`/admin/players/${player.id}`}>
                        <History className="w-3.5 h-3.5 mr-1.5" />
                        Analyze
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
          Active entities cataloged: <span className="text-foreground font-bold">{players.length}</span>
        </p>
      </div>
    </div>
  );
}
