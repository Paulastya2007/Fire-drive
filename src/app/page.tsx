"use client";

import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
     // You can return a more sophisticated loading skeleton here if needed
    return (
        <div className="flex items-center justify-center min-h-screen">
             <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  return (
    <>
      {user ? <Dashboard /> : <LoginPage />}
    </>
  );
}
