'use client';

import { useState, useEffect } from 'react';
import { Github, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase/provider';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function GitHubConnectForm() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [githubUser, setGithubUser] = useState<{
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
  } | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;

    // Listen for changes in the user's document to get the GitHub token
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().githubToken) {
        setIsConnected(true);
        // Fetch GitHub user info if token exists
        try {
          const res = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `token ${docSnap.data().githubToken}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setGithubUser(data);
          } else {
            // Token might be invalid
            setIsConnected(false);
            setGithubUser(null);
          }
        } catch (err) {
          console.error('Error fetching GitHub user:', err);
        }
      } else {
        setIsConnected(false);
        setGithubUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin (optional but recommended)
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data.token) {
        if (!user || !firestore) return;

        try {
          await setDoc(doc(firestore, 'users', user.uid), {
            githubToken: event.data.token,
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          toast({
            title: 'GitHub Connected',
            description: 'Your GitHub account has been successfully connected.',
          });
        } catch (err) {
          console.error('Error saving GitHub token:', err);
          toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: 'Failed to save GitHub connection. Please try again.',
          });
        } finally {
          setIsConnecting(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, firestore, toast]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/auth/github/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        url,
        'github_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Could not initiate GitHub connection.',
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user || !firestore) return;
    setIsLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        githubToken: null,
      }, { merge: true });
      
      toast({
        title: 'GitHub Disconnected',
        description: 'Your GitHub account has been disconnected.',
      });
    } catch (err) {
      console.error('Error disconnecting GitHub:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-white/10 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <Github className="h-8 w-8" />
          </div>
          <div>
            <CardTitle>GitHub Connection</CardTitle>
            <CardDescription>
              Connect your GitHub account to sync with your repositories.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isConnected && githubUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                  <Image 
                    src={githubUser.avatar_url} 
                    alt={githubUser.login} 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{githubUser.name || githubUser.login}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">@{githubUser.login}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href={githubUser.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Profile
                </a>
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Connected Repository</p>
              <a 
                href="https://github.com/vipulkaju/studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                vipulkaju/studio
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <Github className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Connect your GitHub account to access your studio repository and sync your production data.
              </p>
              <Button 
                onClick={handleConnect} 
                className="w-full h-12 rounded-2xl font-bold"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-5 w-5" />
                    Connect GitHub
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
              <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> You will need to provide your GitHub Client ID and Secret in the application settings to enable this integration.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
