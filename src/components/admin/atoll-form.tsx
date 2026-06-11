
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  X, 
  Loader2, 
  AlertCircle, 
  Map as MapIcon,
  Layers,
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase/client';

const atollSchema = z.object({
  code: z.string().min(1, "Atoll code is required (e.g., HA)"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  display_order: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
});

type AtollFormValues = z.infer<typeof atollSchema>;

interface AtollFormProps {
  initialData?: Partial<AtollFormValues> & { id?: string };
  isEdit?: boolean;
}

export function AtollForm({ initialData, isEdit }: AtollFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any>(null);

  const form = useForm<AtollFormValues>({
    resolver: zodResolver(atollSchema),
    defaultValues: {
      code: '',
      name: '',
      display_order: 0,
      is_active: true,
      ...initialData,
    },
  });

  async function onSubmit(data: AtollFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && initialData?.id) {
        const { error: updateError } = await supabase
          .from('atolls')
          .update(data)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('atolls')
          .insert([data]);

        if (insertError) throw insertError;
      }

      router.push('/admin/atolls');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving atoll:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto pb-12">
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Registry Failure</AlertTitle>
            <AlertDescription className="font-body text-xs mt-1 italic">
              {error.message || "Unique constraint violation or database interruption."}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/60 bg-card/30">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" />
              Atoll Identity
            </CardTitle>
            <CardDescription className="font-body text-xs">Define the code and common name for this geographical node.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Atoll Code</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. HA" {...field} className="bg-background/50 font-mono font-bold" />
                    </FormControl>
                    <FormDescription className="text-[9px]">Standard registry code.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Haa Alif" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormDescription className="text-[9px]">The formal archival name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Display Order
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-background/50 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/40 p-4 bg-background/20 mt-2">
                    <FormLabel className="font-headline text-xs uppercase tracking-wider">Active Status</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting} className="w-full font-headline font-bold uppercase tracking-widest py-6">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Geography...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Commit Atoll
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full font-headline font-bold uppercase tracking-widest border-border/60"
          >
            Abort Mapping
          </Button>
        </div>
      </form>
    </Form>
  );
}
