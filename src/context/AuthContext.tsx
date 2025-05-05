
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // auth might be undefined if initialization fails
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only subscribe if auth is initialized
    if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        }, (error) => {
           // Handle potential errors during auth state observation
           console.error("Auth state change error:", error);
           setUser(null); // Assume logged out on error
           setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    } else {
        // If auth is not available (e.g., missing API key), stop loading and set user to null
        console.warn("Firebase Auth is not initialized. User authentication will not function.");
        setLoading(false);
        setUser(null);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Display a loading skeleton or spinner while auth state is being determined
  // or if auth is potentially initializing.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 ml-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

