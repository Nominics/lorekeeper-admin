"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  X, 
  Loader2, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Image as ImageIcon,
  Upload,
  Gift,
  Palette,
  Bell,
  ScrollText,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from 'next/link';

const REWARD_TYPES = ["none", "card", "cowry", "title", "badge"];

const eventSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  banner_url: z.string().optional(),
  atoll: z.string().optional(),
  start_date: z.date({
    required_error: "A start date is required.",
  }),
  end_date: z.date({
    required_error: "An end date is required.",
  }),
  is_active: z.boolean().default(true),
  popup_enabled: z.boolean().default(false),
  reward_type: z.string().min(1),
  theme_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").default("#E6B81A"),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Partial<EventFormValues>;
  isEdit?: boolean;
}

interface Atoll {
  id: string;
  code: string;
  admin_name: string;
}

export function EventForm({ initialData, isEdit }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [atolls, setAtolls] = useState<Atoll[]>([]);
  const [atollsLoading, setAtollsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: '',
      title: '',
      description: '',
      banner_url: '',
      atoll: '',
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week default
      is_active: true,
      popup_enabled: false,
      reward_type: 'none',
      theme_color: '#E6B81A',
      ...initialData,
    },
  });

  useEffect(() => {
    async function fetchAtolls() {
      try {
        setAtollsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('atolls')
          .select('id, code, admin_name')
          .eq('enabled', true)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        setAtolls(data || []);
      } catch (err: any) {
        console.error('Failed to load atolls:', err);
      } finally {
        setAtollsLoading(false);
      }
    }
    fetchAtolls();
  }, []);

  const eventId = form.watch('id');
  const currentBannerUrl = form.watch('banner_url');

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!eventId) {
      setError({ message: "Event ID is required before uploading a banner." });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banners/${eventId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('event-banners')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-banners')
        .getPublicUrl(fileName);

      form.setValue('banner_url', publicUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
      };

      if (isEdit) {
        const { error: updateError } = await supabase
          .from('events')
          .update(payload)
          .eq('id', payload.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert([payload]);

        if (insertError) throw insertError;
      }

      router.push('/admin/events');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err);
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
            <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Archive Transmission Failure</AlertTitle>
            <AlertDescription className="font-body text-xs mt-1 italic">
              {error.message || "The chronicle update was rejected by the registry."}
            </AlertDescription>
          </Alert>
        )}

        {isEdit && (
          <div className="flex justify-end">
            <Button variant="outline" asChild className="border-primary/40 hover:bg-primary/10 text-primary font-headline text-xs uppercase tracking-widest">
              <Link href={`/admin/events/${eventId}/cards`}>
                <ScrollText className="w-4 h-4 mr-2" />
                Manage Event Cards
              </Link>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Chronicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Event ID</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. rannamaari-2026" {...field} disabled={isEdit} className="bg-background/50 font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Chronicle Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Event Name" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Event Narrative</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the chronicle..." {...field} className="bg-background/50 min-h-[120px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="atoll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Atoll Region</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={atollsLoading}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder={atollsLoading ? "Loading..." : "Select Region (Optional)"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">Universal Event</SelectItem>
                            {atolls.map(a => (
                              <SelectItem key={a.id} value={a.code}>{a.admin_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Genesis Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-background/50",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Conclusion Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-background/50",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < (form.getValues('start_date') || new Date())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Chronicle Imagery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full aspect-[21/9] bg-background/50 rounded-lg border border-border/40 overflow-hidden group">
                    {currentBannerUrl ? (
                      <img src={currentBannerUrl} alt="Event Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-xs font-headline uppercase tracking-widest">No Banner Assets</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-xs font-headline uppercase tracking-widest">Transmitting Imagery</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={isUploading || !eventId}
                      onClick={() => fileInputRef.current?.click()}
                      className="font-headline text-[10px] uppercase tracking-[0.2em] border-primary/20 hover:bg-primary/10"
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />}
                      Upload Chronicle Banner
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png,image/jpeg,image/webp" 
                      onChange={handleBannerUpload}
                    />
                    <FormField
                      control={form.control}
                      name="banner_url"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Public URL fallback" {...field} className="bg-background/50 font-mono text-[10px] h-9" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Visual Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="theme_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Atmospheric Color</FormLabel>
                      <div className="flex gap-3">
                        <FormControl>
                          <Input {...field} className="bg-background/50 font-mono" />
                        </FormControl>
                        <div 
                          className="w-10 h-10 rounded-sm border border-border" 
                          style={{ backgroundColor: field.value }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/40 p-4 bg-background/20">
                        <FormLabel className="font-headline text-xs uppercase tracking-wider">Chronicle Active</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="popup_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/40 p-4 bg-background/20">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary" />
                          <FormLabel className="font-headline text-xs uppercase tracking-wider">Initial Popup</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Reward Logic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="reward_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Reward Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 capitalize">
                            <SelectValue placeholder="Select Reward" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REWARD_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting || isUploading} className="w-full font-headline font-bold uppercase tracking-widest py-6">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Archiving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Commit Chronicle
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full font-headline font-bold uppercase tracking-widest border-border/60"
              >
                Abort Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}