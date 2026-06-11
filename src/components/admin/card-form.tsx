"use client";

import React, { useEffect, useState, useRef } from 'react';
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
  Zap,
  Upload,
  Image as ImageIcon,
  CheckCircle2
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

interface ArchivalError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

interface Atoll {
  code: string;
  admin_name: string;
}

export function CardForm({ initialData, isEdit }: CardFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isHoloUploading, setIsHoloUploading] = useState(false);
  const [error, setError] = useState<ArchivalError | null>(null);
  const [atolls, setAtolls] = useState<Atoll[]>([]);
  const [atollsLoading, setAtollsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const holoFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      id: '',
      card_name: '',
      class: 'Person',
      rarity: 'Common',
      atoll: '',
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
  const cardId = form.watch('id');
  const currentImageUrl = form.watch('image_url');
  const currentHoloImageUrl = form.watch('holo_image_url');

  // Fetch Atolls
  useEffect(() => {
    async function fetchAtolls() {
      try {
        setAtollsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('atolls')
          .select('code, admin_name')
          .eq('enabled', true)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        setAtolls(data || []);
        
        // If first load and no atoll set, pick first active
        if (!form.getValues('atoll') && data && data.length > 0) {
          form.setValue('atoll', data[0].code);
        }
      } catch (err: any) {
        console.error('Failed to load atolls:', err);
      } finally {
        setAtollsLoading(false);
      }
    }
    fetchAtolls();
  }, [form]);

  // Auto-fill logic based on rarity
  useEffect(() => {
    if (selectedRarity && RARITY_PRESETS[selectedRarity] && !isEdit) {
      const preset = RARITY_PRESETS[selectedRarity];
      form.setValue('base_power', preset.power);
      form.setValue('holo_chance', preset.holo);
    }
  }, [selectedRarity, form, isEdit]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'normal' | 'holo') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cardId) {
      setError({ message: "Archive ID is required before uploading artwork." });
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError({ message: "Unsupported format. Use PNG, JPG, or WEBP." });
      return;
    }

    if (type === 'normal') setIsUploading(true);
    else setIsHoloUploading(true);
    
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const folder = type === 'normal' ? 'normal' : 'holo';
      const fileName = `${folder}/${cardId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('card-art')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('card-art')
        .getPublicUrl(fileName);

      if (type === 'normal') form.setValue('image_url', publicUrl);
      else form.setValue('holo_image_url', publicUrl);

    } catch (err: any) {
      console.error('Upload failed:', err);
      setError({
        message: err.message || 'The archive rejected the artwork transmission.',
        code: err.code
      });
    } finally {
      if (type === 'normal') {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setIsHoloUploading(false);
        if (holoFileInputRef.current) holoFileInputRef.current.value = '';
      }
    }
  }

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
      setError({
        message: err.message || 'The archive rejected the update.',
        code: err.code,
        details: err.details,
        hint: err.hint,
      });
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
            <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              Transmission Error
              {error.code && <span className="font-mono text-[9px] bg-destructive/20 px-1.5 py-0.5 rounded text-destructive leading-none">Code: {error.code}</span>}
            </AlertTitle>
            <AlertDescription className="font-body text-xs mt-2 space-y-2">
              <p className="font-bold italic">{error.message}</p>
              {error.details && (
                <div className="pt-1 border-t border-destructive/20 mt-1">
                  <span className="uppercase text-[9px] tracking-widest opacity-70 block mb-0.5">Details:</span>
                  <p className="opacity-90">{error.details}</p>
                </div>
              )}
              {error.hint && (
                <div className="pt-1 border-t border-destructive/20">
                  <span className="uppercase text-[9px] tracking-widest opacity-70 block mb-0.5">Hint:</span>
                  <p className="opacity-90 font-mono text-[10px]">{error.hint}</p>
                </div>
              )}
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={atollsLoading}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder={atollsLoading ? "Loading Atolls..." : "Select Atoll"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {atolls.map(a => (
                              <SelectItem key={a.code} value={a.code}>
                                <span className="font-mono mr-2">{a.code}</span> — {a.admin_name}
                              </SelectItem>
                            ))}
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
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Visual Archiving
                </CardTitle>
                <CardDescription className="font-body text-xs">Transmit visual data to the digital vault.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-12">
                {/* Normal Artwork Section */}
                <div className="space-y-4">
                  <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Standard Registry Artwork</FormLabel>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative w-full md:w-40 aspect-[3/4] bg-background/50 rounded-lg border border-border/40 flex items-center justify-center overflow-hidden group">
                      {currentImageUrl ? (
                        <img src={currentImageUrl} alt="Card Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-[10px] font-headline uppercase tracking-tighter">No Image</span>
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="text-[10px] font-headline uppercase tracking-widest animate-pulse">Uploading</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex flex-col gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          disabled={isUploading || isHoloUploading || !cardId}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full md:w-auto font-headline text-[10px] uppercase tracking-[0.2em] border-primary/20 hover:bg-primary/10 h-10"
                        >
                          {isUploading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />}
                          {currentImageUrl ? "Update Registry Art" : "Select Registry Art"}
                        </Button>
                        {!cardId && <p className="text-[10px] text-rose-500 font-body italic flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Initialize Archive ID first</p>}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/png,image/jpeg,image/webp" 
                          onChange={(e) => handleImageUpload(e, 'normal')}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Manual URL Fallback</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} className="bg-background/50 font-mono text-[10px]" />
                            </FormControl>
                            <FormDescription className="text-[9px] italic">Archive storage links are automatically synced here.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Holographic Artwork Section */}
                <div className="space-y-4 pt-6 border-t border-border/40">
                  <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground block mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Prismatic Variant Artwork
                  </FormLabel>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative w-full md:w-40 aspect-[3/4] bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-center overflow-hidden group">
                      {currentHoloImageUrl ? (
                        <img src={currentHoloImageUrl} alt="Holo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-primary/20">
                          <Sparkles className="w-8 h-8" />
                          <span className="text-[10px] font-headline uppercase tracking-tighter">No Holo</span>
                        </div>
                      )}
                      {isHoloUploading && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="text-[10px] font-headline uppercase tracking-widest animate-pulse">Prismatic Shift</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex flex-col gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          disabled={isUploading || isHoloUploading || !cardId}
                          onClick={() => holoFileInputRef.current?.click()}
                          className="w-full md:w-auto font-headline text-[10px] uppercase tracking-[0.2em] border-primary/40 hover:bg-primary/20 h-10"
                        >
                          {isHoloUploading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                          {currentHoloImageUrl ? "Update Prismatic Art" : "Select Prismatic Art"}
                        </Button>
                        <input 
                          type="file" 
                          ref={holoFileInputRef} 
                          className="hidden" 
                          accept="image/png,image/jpeg,image/webp" 
                          onChange={(e) => handleImageUpload(e, 'holo')}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="holo_image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Holographic URL Fallback</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} className="bg-background/50 font-mono text-[10px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Combat Calibration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Holo Probability (0-1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} className="bg-background/50 font-mono" />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">Archive sync chance for prismatic variations.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Archival Meta
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  name="artist_note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Artist Attribution</FormLabel>
                      <FormControl>
                        <Input placeholder="Attribution..." {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Internal Admin Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Internal archival notes..." {...field} className="bg-background/50 text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting || isUploading || isHoloUploading} className="w-full font-headline font-bold uppercase tracking-widest py-6">
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
