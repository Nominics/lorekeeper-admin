
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  FilterX, 
  ChevronRight,
  Database,
  Eye,
  EyeOff
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

interface CardData {
  id: string;
  card_name: string;
  class: string;
  rarity: string;
  atoll: string;
  set_name: string;
  base_power: number;
  holo_chance: number;
  enabled: boolean;
}

const RARITIES = ["Common", "Rare", "Epic", "Legendary"];
const CLASSES = ["Person", "Beast", "Fable", "Lore", "Relic", "Location"];
const ATOLLS = ["HA", "HDh", "Sh", "N", "R", "B", "Lh", "K", "AA", "ADh", "V", "M", "F", "Dh", "Th", "L", "GA", "GDh", "Gn", "S", "GA/GDh"];

export default function CardsListPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [atollFilter, setAtollFilter] = useState("all");
  const [enabledFilter, setEnabledFilter] = useState("all");

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('cards').select('*');

      if (search) {
        query = query.or(`card_name.ilike.%${search}%,id.ilike.%${search}%`);
      }
      
      if (rarityFilter !== "all") {
        query = query.eq('rarity', rarityFilter);
      }
      
      if (classFilter !== "all") {
        query = query.eq('class', classFilter);
      }
      
      if (atollFilter !== "all") {
        query = query.eq('atoll', atollFilter);
      }
      
      if (enabledFilter !== "all") {
        query = query.eq('enabled', enabledFilter === "enabled");
      }

      const { data, error: fetchError } = await query.order('card_name', { ascending: true });

      if (fetchError) throw fetchError;
      setCards(data || []);
    } catch (err: any) {
      console.error('Error fetching cards:', err);
      setError(err.message || 'Failed to retrieve card data from the archive.');
    } finally {
      setLoading(false);
    }
  }, [search, rarityFilter, classFilter, atollFilter, enabledFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCards();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchCards]);

  const resetFilters = () => {
    setSearch("");
    setRarityFilter("all");
    setClassFilter("all");
    setAtollFilter("all");
    setEnabledFilter("all");
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return <Badge variant="outline" className="border-slate-500/50 text-slate-400">Common</Badge>;
      case 'rare': return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Rare</Badge>;
      case 'epic': return <Badge variant="outline" className="border-purple-500/50 text-purple-400">Epic</Badge>;
      case 'legendary': return <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">Legendary</Badge>;
      default: return <Badge variant="outline">{rarity}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Card Registry
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Browse and manage the collective knowledge of the digital archive.
          </p>
        </div>
        <Button asChild className="font-headline font-bold">
          <Link href="/admin/cards/new">
            <Plus className="w-4 h-4 mr-2" />
            Initialize New Card
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
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-headline">Query Filters</CardTitle>
          <CardDescription className="font-body text-xs">Narrow down archival records by specific parameters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background/50 border-border/60 focus:ring-primary"
                />
              </div>
            </div>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="bg-background/50 border-border/60">
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {RARITIES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="bg-background/50 border-border/60">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={atollFilter} onValueChange={setAtollFilter}>
              <SelectTrigger className="bg-background/50 border-border/60 text-xs">
                <SelectValue placeholder="All Atolls" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Atolls</SelectItem>
                {ATOLLS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={enabledFilter} onValueChange={setEnabledFilter}>
                <SelectTrigger className="bg-background/50 border-border/60 flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
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
              Filtering Registry Nodes...
            </p>
          </div>
        ) : cards.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
            <Database className="w-10 h-10 text-muted-foreground/20" />
            <p className="font-headline text-lg font-medium text-muted-foreground">No records found</p>
            <p className="text-xs text-muted-foreground/60 font-body italic">Adjust your query filters or initialize a new record.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="font-headline uppercase tracking-widest text-[10px] w-[100px]">ID</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Name</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Class</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Rarity</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Atoll</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Power</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Holo %</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px] text-center">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{card.id}</TableCell>
                  <TableCell className="font-headline font-bold text-sm tracking-tight">{card.card_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] uppercase font-headline py-0">{card.class}</Badge>
                  </TableCell>
                  <TableCell>{getRarityBadge(card.rarity)}</TableCell>
                  <TableCell className="font-headline text-xs text-muted-foreground">{card.atoll}</TableCell>
                  <TableCell className="font-mono text-sm">{card.base_power}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{(card.holo_chance * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-center">
                    {card.enabled ? (
                      <div className="inline-flex items-center gap-1.5 text-emerald-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-headline uppercase tracking-wider">Active</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-rose-500">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-headline uppercase tracking-wider">Hidden</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 hover:bg-primary hover:text-primary-foreground">
                      <Link href={`/admin/cards/${card.id}/edit`}>
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
          Total archival records retrieved: <span className="text-foreground font-bold">{cards.length}</span>
        </p>
        <div className="flex items-center gap-1 text-[10px] font-headline uppercase tracking-widest text-primary/60">
          Sync Status: Operational <Database className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
