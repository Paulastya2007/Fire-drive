"use client";

import type React from 'react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';
import FileBrowser from './FileBrowser';
import UploadButton from './UploadButton';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0); // State to trigger refresh

  const handleUploadSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to re-fetch files
  };

  if (!user) {
    // This should ideally not happen if routing is correct, but good practice
    return <p>Please log in to view the dashboard.</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
         <Card className="h-full shadow-md border border-border bg-card">
           <CardContent className="p-4 md:p-6 h-full flex flex-col">
             <div className="mb-4 flex justify-end">
               <UploadButton onUploadSuccess={handleUploadSuccess} />
             </div>
             <div className="flex-grow overflow-hidden">
                <FileBrowser key={refreshKey} /> {/* Use key to force re-render */}
             </div>
           </CardContent>
         </Card>
      </main>
       <footer className="text-center p-4 text-muted-foreground text-sm">
        Powered by Firebase
      </footer>
    </div>
  );
}
