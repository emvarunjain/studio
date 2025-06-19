"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, UserPlus, MessageCircle, Settings2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AppHeader() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Potentially show a toast notification for error
    }
  };

  if (!isClient || authLoading) {
    return (
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="text-2xl font-headline font-bold">
            Genie
          </Link>
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-headline font-bold">
          Genie
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                <Link href="/chat">
                  <MessageCircle className="mr-0 sm:mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                  <Link href="/admin">
                    <Settings2 className="mr-0 sm:mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Button variant="secondary" onClick={handleLogout} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <LogOut className="mr-0 sm:mr-2 h-5 w-5" />
                 <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                <Link href="/login">
                  <LogIn className="mr-0 sm:mr-2 h-5 w-5" />
                   <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              <Button variant="secondary" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/register">
                  <UserPlus className="mr-0 sm:mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
