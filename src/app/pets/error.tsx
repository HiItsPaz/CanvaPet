"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function PetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error in Pets Section:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center justify-center text-center min-h-[400px]">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong in the Pets section.</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error.message || 'We encountered an issue while loading pet information. Please try again, or navigate back to safety.'}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()} // Attempt to recover by trying to re-render the pets segment
          variant="outline"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
        <Link href="/" passHref>
          <Button variant="secondary">Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
} 