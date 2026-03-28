'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInAnonymously,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Login Successful',
        description: 'Welcome to ProductionTrack! Redirecting...',
      });
      router.replace('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not sign in. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-6 flex justify-center transform transition-transform hover:scale-110 duration-300">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl font-bold tracking-tight">
            ProductionTrack
          </CardTitle>
          <CardDescription className="text-base mt-2">
            AI-powered production tracking and insights.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8 px-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click below to enter the dashboard and start tracking your production.
              </p>
            </div>

            <Button 
              size="lg"
              className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-[0.98]" 
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Entering...
                </span>
              ) : (
                'Get Started'
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium opacity-50">
              No password required
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
