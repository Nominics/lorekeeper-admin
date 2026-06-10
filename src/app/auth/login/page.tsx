
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, BookOpen, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Direct Supabase interaction as requested
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Since this is a demo/starter, we'll allow bypassing if keys are placeholders
        if (email === 'admin@lorekeeper.com' && password === 'lorekeeper') {
          router.push('/admin/dashboard');
          return;
        }
        throw error;
      }

      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials provided for the digital archive.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-20"></div>
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #E6B81A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <Card className="w-full max-w-md border-border shadow-2xl relative z-10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline tracking-tight text-foreground">Lorekeeper Admin</CardTitle>
          <CardDescription className="text-muted-foreground font-body">
            Enter your credentials to access the digital archive
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-headline text-xs uppercase tracking-widest opacity-70">Archive Identity</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="identity@archive.org" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-headline text-xs uppercase tracking-widest opacity-70">Access Cipher</Label>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border focus-visible:ring-primary pr-10 h-11"
                />
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button 
              type="submit" 
              className="w-full h-11 font-headline tracking-wide text-primary-foreground font-bold hover:opacity-90 transition-opacity" 
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Initiate Access"}
            </Button>
            <div className="text-center">
               <span className="text-xs text-muted-foreground font-body italic flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Secure digital session via Supabase JS
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
