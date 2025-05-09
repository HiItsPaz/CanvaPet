import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <ShieldAlert className="h-16 w-16 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
      
      <p className="text-xl mb-8 text-muted-foreground max-w-md">
        You don&apos;t have permission to access this page.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="default">
          <Link href="/auth/signin">
            <Lock className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
        
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
} 