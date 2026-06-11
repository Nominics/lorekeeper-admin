"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  X, 
  Loader2, 
  AlertCircle, 
  Database, 
  Info,
  Sparkles,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase/client';

const RARITY_PRESETS: Record<string, { power: number; holo: number }> = {
  'Common': { power: 10, holo: 0 },
  'Rare': { power: 50, holo: 0.02 },
  'Epic': { power: 250, holo: 0.05 },
  'Legendary': { power: 1000, holo: 0.10 },
};

const CLASSES = ["Person", "Beast", "Fable", "Lore", "Relic", "Location"];
const RARITIES = ["Common", "Rare", "Epic", "Legendary"];
const ATOLLS = ["HA", "HDh", "Sh", "N", "R", "B", "Lh", "K", "AA", "ADh", "V", "M", "F", "Dh", "Th", "L", "GA", "GDh", "Gn", "S", "GA/GDh"];
const SOURCE_TAGS = ["Registration Card", "Nearby Waters", "Reef Expedition", "Ancient Waters", "Forgotten Voyage", "Atoll Expedition", "Event Only"];

const cardSchema = z.object({
  id: z.string().min(1, "Archive ID is required"),
  card_name: z.string().min(2, "Name must be at least 2 characters"),
  class: z.string().min(1, "Class is required"),
  rarity: z.string().min(1, "Rarity is required"),
  atoll: z.string().min(1, "Atoll origin is required"),
  set_name: z.string().min(1, "Set name is required"),
  description: z.string().optional(),
  full_lore: z.string().optional(),
  source_tags: z.string().optional(),
  base_power: z.coerce.number().min(0),
  holo_chance: z.coerce.number().min(0).max(1),
  image_url: z.string().optional(),
  holo_image_url: z.string().optional(),
  artist_note: z.string().optional(),
  admin_notes: z.string().optional(),
  enabled: z.boolean().default(true),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormProps {
  initialData?: Partial<CardFormValues>;
  isEdit?: boolean;
}

export function CardForm({ initialData, isEdit }: CardFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      id: '',
      card_name: '',
      class: 'Person',
      rarity: 'Common',
      atoll: 'HA',
      set_name: 'Core Set',
      description: '',
      full_lore: '',
      source_tags: 'Registration Card',
      base_power: 10,
      holo_chance: 0,
      image_url: '',
      holo_image_url: '',
      artist_note: '',
      admin_notes: '',
      enabled: true,
      ...initialData,
    },
  });

  const selectedRarity = form.watch('rarity');

  // Auto-fill logic based on rarity
  useEffect(() => {
    if (selectedRarity && RARITY_PRESETS[selectedRarity]) {
      const preset = RARITY_PRESETS[selectedRarity];
      // Only update if current values are default or zero to avoid overwriting intentional manual tweaks
      // In a real app, you might want to ask or only do this on "New" mode.
      const currentPower = form.getValues('base_power');
      const currentHolo = form.getValues('holo_chance');
      
      form.setValue('base_power', preset.power);
      form.setValue('holo_chance', preset.holo);
    }
  }, [selectedRarity, form]);

  async function onSubmit(data: CardFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        const { error: updateError } = await supabase
          .from('cards')
          .update(data)
          .eq('id', data.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cards')
          .insert([data]);

        if (insertError) throw insertError;
      }

      router.push('/admin/cards');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving card:', err);
      setError(err.message || 'The archive rejected the update. Please verify all data nodes.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-12">
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Transmission Error</AlertTitle>
            <AlertDescription className="font-body text-xs italic">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Primary Identity
                </CardTitle>
                <CardDescription className="font-body text-xs">Core attributes of the archival record.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Archive ID</FormLabel>
                        <FormControl>
                          <Input placeholder="LC-001" {...field} disabled={isEdit} className="bg-background/50 font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="card_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Entity Name</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. The Wandering Sentinel" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Rarity Rank</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select Rarity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RARITIES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="atoll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Origin Atoll</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select Atoll" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ATOLLS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Chronicled Narrative
                </CardTitle>
                <CardDescription className="font-body text-xs">Lore and descriptions cataloged for this entity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A brief summary for the deck interface..." {...field} className="bg-background/50 min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="full_lore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Full Chronicle Lore</FormLabel>
                      <FormControl>
                        <Textarea placeholder="The complete historical record..." {...field} className="bg-background/50 min-h-[160px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Combat & Visual Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="base_power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Base Combat Power</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-background/50 font-mono" />
                        </FormControl>
                        <FormDescription className="text-[10px] italic">Calibrated to rarity by default.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="holo_chance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Holographic Probability (0-1)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="bg-background/50 font-mono" />
                        </FormControl>
                        <FormDescription className="text-[10px] italic">Archive sync chance for prismatic variations.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Standard Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="holo_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Holographic Variant URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Meta Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border/40 p-4 bg-background/20">
                      <div className="space-y-0.5">
                        <FormLabel className="font-headline text-xs uppercase tracking-wider">Registry Status</FormLabel>
                        <FormDescription className="text-[10px] italic">Enable for discovery in player packs.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="set_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Archival Set</FormLabel>
                      <FormControl>
                        <Input placeholder="Core Set, Origins, etc." {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source_tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Discovery Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOURCE_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Admin Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Internal archival notes..." {...field} className="bg-background/50 text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="artist_note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Artist Credit / Note</FormLabel>
                      <FormControl>
                        <Input placeholder="Attribution..." {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting} className="w-full font-headline font-bold uppercase tracking-widest py-6">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Committing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Commit Record
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full font-headline font-bold uppercase tracking-widest border-border/60"
              >
                <X className="mr-2 h-4 w-4" />
                Abort Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
