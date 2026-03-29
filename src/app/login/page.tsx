'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { motion } from 'motion/react';

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
  const [isRedirecting, setIsRedirecting] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setIsRedirecting(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
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
        description: 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Logo />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card/80 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden rounded-[2.5rem]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          
          <CardHeader className="text-center pt-10">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="mx-auto mb-8 flex justify-center"
            >
              <Logo />
            </motion.div>
            <CardTitle className="font-headline text-4xl font-black tracking-tight text-foreground">
              ProductionTrack
            </CardTitle>
            <CardDescription className="text-base mt-3 font-medium text-muted-foreground/80">
              AI-powered production tracking and insights.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-10 px-10">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest">
                  Welcome back
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-base font-bold shadow-sm transition-all hover:bg-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-4 rounded-2xl border-white/60 bg-white/40" 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="bg-card px-4 text-muted-foreground/40">Or</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  variant="ghost"
                  className="w-full h-14 text-sm font-bold transition-all hover:bg-white/60 active:scale-[0.98] rounded-2xl text-muted-foreground hover:text-foreground" 
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Entering...
                    </span>
                  ) : (
                    'Continue as Guest'
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-center text-muted-foreground/40 uppercase tracking-[0.2em] font-black">
                Secure authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
