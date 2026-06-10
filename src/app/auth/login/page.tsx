"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, BookOpen, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/admin/dashboard');
        } else {
          setIsVerifying(false);
        }
      } catch (err: any) {
        console.error('Initial session check failed:', err);
        setIsVerifying(false);
        if (err.message === 'Failed to fetch') {
          setNetworkError("The digital archive is unreachable. Please check your network connection or ensure the Supabase URL is correct.");
        }
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNetworkError(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        toast({
          title: "Access Granted",
          description: "Welcome back to the digital archive.",
        });
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      const isNetworkError = error.message === 'Failed to fetch' || error.name === 'TypeError';
      const errorMessage = isNetworkError 
        ? "Network Error: Could not connect to the authentication server. This may be due to a blocked URL or a restricted environment."
        : error.message || "Invalid credentials provided for the digital archive.";

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: errorMessage,
      });

      if (isNetworkError) {
        setNetworkError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-20"></div>
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #E6B81A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        {networkError && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Connection Warning</AlertTitle>
            <AlertDescription className="font-body text-xs italic">
              {networkError}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border shadow-2xl bg-card/80 backdrop-blur-sm">
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Initiate Access"
                )}
              </Button>
              <div className="text-center">
                 <span className="text-xs text-muted-foreground font-body italic flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Secure digital session via Supabase Auth
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
