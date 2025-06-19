"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { reloadConfigAction, getCurrentConfigAction } from '@/app/actions/adminActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, RefreshCw } from 'lucide-react';

interface AppConfig {
  appName: string;
  apiEndpoint: string;
  defaultBotMessage: string;
  features: Record<string, any>;
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "You are not authorized to view this page.", variant: "destructive" });
      router.replace('/chat'); // Or to a dedicated "access denied" page
    }
  }, [isAdmin, authLoading, router, toast]);
  
  useEffect(() => {
    async function fetchConfig() {
      if (isAdmin) {
        setIsLoadingConfig(true);
        try {
          const currentConfig = await getCurrentConfigAction();
          setConfig(currentConfig);
        } catch (error: any) {
          toast({ title: "Error", description: `Failed to load configuration: ${error.message}`, variant: "destructive" });
        } finally {
          setIsLoadingConfig(false);
        }
      }
    }
    fetchConfig();
  }, [isAdmin, toast]);

  const handleReloadConfig = async () => {
    setIsReloading(true);
    try {
      const newConfig = await reloadConfigAction();
      setConfig(newConfig);
      toast({ title: "Success", description: "Configuration reloaded successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to reload configuration: ${error.message}`, variant: "destructive" });
    } finally {
      setIsReloading(false);
    }
  };

  if (authLoading || (!isAdmin && !authLoading)) {
     // Show loader or nothing while auth state is resolving or if not admin (redirect will happen)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Verifying access...</p>
      </div>
    );
  }
  
  if (!isAdmin && user) { // Explicitly handle non-admin user who is logged in
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/chat')} className="mt-6">Go to Chat</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Admin Portal</CardTitle>
          <CardDescription>Manage application settings and configurations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingConfig ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading configuration...</p>
            </div>
          ) : config ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Current Configuration:</h3>
                <pre className="mt-2 p-4 bg-muted rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Could not load configuration.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleReloadConfig} disabled={isReloading || isLoadingConfig} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
            {isReloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Reload Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
