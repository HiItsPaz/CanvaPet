'use client';

import { UserGallery } from '@/components/profile/UserGallery';
import { createClient } from '@/lib/supabase/client'; // Use client component client
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setError('Failed to authenticate.');
        console.error("Auth error:", sessionError);
      } else if (session?.user) {
        setUserId(session.user.id);
      } else {
        setError('Please log in to view your gallery.');
        // Optionally redirect to login
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
         <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-lg font-semibold">Authentication Error</p>
            <p className="text-sm">{error}</p>
            {/* Optionally add a login button */} 
         </div>
      </div>
    );
  }

  if (!userId) {
      // Should ideally be caught by error state, but as a fallback
      return <p>User not found.</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <UserGallery userId={userId} />
    </div>
  );
} 