
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  AlertCircle,
  Database,
  ScrollText,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  banner_url?: string;
}

interface CardData {
  id: string;
  card_name: string;
  rarity: string;
  class: string;
  atoll: string;
}

interface EventCardLink {
  event_id: string;
  card_id: string;
  cards: CardData;
}

export default function EventCardsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [linkedCards, setLinkedCards] = useState<EventCardLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Card Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      const [eventRes, linksRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('event_cards').select('event_id, card_id, cards(*)').eq('event_id', id)
      ]);

      if (eventRes.error) throw eventRes.error;
      setEvent(eventRes.data);
      setLinkedCards((linksRes.data as any) || []);
    } catch (err: any) {
      console.error('Error fetching event cards:', err);
      setError(err.message || 'Failed to retrieve chronicle link data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data, error: searchError } = await supabase
        .from('cards')
        .select('id, card_name, rarity, class, atoll')
        .or(`card_name.ilike.%${query}%,id.ilike.%${query}%`)
        .limit(5);

      if (searchError) throw searchError;
      setSearchResults(data || []);
    } catch (err: any) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const addCardToEvent = async (card: CardData) => {
    if (linkedCards.some(link => link.card_id === card.id)) {
      alert('This entity is already linked to the current chronicle.');
      return;
    }

    try {
      setIsAdding(card.id);
      const { error: insertError } = await supabase
        .from('event_cards')
        .insert([{ event_id: id, card_id: card.id }]);

      if (insertError) throw insertError;
      
      // Update local state
      setLinkedCards(prev => [...prev, { event_id: id as string, card_id: card.id, cards: card }]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err: any) {
      console.error('Link failed:', err);
      setError(err.message);
    } finally {
      setIsAdding(null);
    }
  };

  const removeCardFromEvent = async (cardId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('event_cards')
        .delete()
        .eq('event_id', id)
        .eq('card_id', cardId);

      if (deleteError) throw deleteError;
      
      setLinkedCards(prev => prev.filter(link => link.card_id !== cardId));
    } catch (err: any) {
      console.error('De-link failed:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Chronicle Links...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 -ml-2 text-muted-foreground hover:text-primary">
              <Link href={`/admin/events/${id}/edit`}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Chronicle
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-primary" />
            Linked Archival Entities
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Manage cards associated with the <span className="text-primary font-bold">{event?.title}</span> chronicle.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Transmission Failure</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Registry Linkage
              </CardTitle>
              <CardDescription className="font-body text-xs">
                Total entities linked to this chronicle: <span className="text-foreground font-bold">{linkedCards.length}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="font-headline uppercase tracking-widest text-[10px]">ID</TableHead>
                      <TableHead className="font-headline uppercase tracking-widest text-[10px]">Name</TableHead>
                      <TableHead className="font-headline uppercase tracking-widest text-[10px]">Rarity</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedCards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic font-body text-xs">
                          No entities currently linked to this chronicle node.
                        </TableCell>
                      </TableRow>
                    ) : (
                      linkedCards.map((link) => (
                        <TableRow key={link.card_id} className="border-border/40 hover:bg-primary/5 group">
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{link.card_id}</TableCell>
                          <TableCell className="font-headline font-bold text-sm">{link.cards?.card_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] uppercase font-headline">
                              {link.cards?.rarity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeCardFromEvent(link.card_id)}
                              className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Link Entity
              </CardTitle>
              <CardDescription className="font-body text-xs">Search the primary registry to associate new nodes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/60"
                />
              </div>

              <div className="space-y-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="rounded-md border border-border/40 bg-background/20 divide-y divide-border/40">
                    {searchResults.map((card) => (
                      <div key={card.id} className="p-3 flex items-center justify-between hover:bg-primary/5 transition-colors group">
                        <div className="flex flex-col">
                          <span className="font-headline font-bold text-xs">{card.card_name}</span>
                          <span className="font-mono text-[9px] text-muted-foreground">{card.id} • {card.rarity}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          disabled={isAdding === card.id || linkedCards.some(l => l.card_id === card.id)}
                          onClick={() => addCardToEvent(card)}
                          className="h-7 px-2 text-[10px] font-headline uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          {isAdding === card.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : linkedCards.some(l => l.card_id === card.id) ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Link
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground italic font-body">
                    No registry nodes found for this query.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {event?.banner_url && (
            <Card className="border-border/60 bg-card/30 overflow-hidden">
              <div className="aspect-[21/9] w-full relative">
                <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-headline uppercase tracking-widest text-primary font-bold">Chronicle Asset</span>
                    <span className="text-sm font-headline font-bold truncate max-w-[200px]">{event.title}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
            <h4 className="font-headline text-[10px] uppercase tracking-widest text-primary font-bold">Archival Insight</h4>
            <p className="text-[11px] text-muted-foreground font-body italic leading-relaxed">
              Linking an entity to a chronicle makes it discoverable through event-specific pathways during the designated timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
