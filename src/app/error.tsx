"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops, something went wrong!</h2>
          <p className="text-muted-foreground mb-6 text-center">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <Button
            onClick={() => reset()} // Attempt to recover by trying to re-render the segment
            variant="destructive"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
} 