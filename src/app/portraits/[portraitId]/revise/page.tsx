'use client';

import { useParams } from 'next/navigation';
import { RevisionForm } from '@/components/revision/RevisionForm';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RevisePortraitPage() {
    const params = useParams();
    const portraitId = params.portraitId as string;
    const { user, loading: authLoading } = useAuth(); // Get user and loading state

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If loading is finished and there's no user, show login prompt
    if (!user) {
         return (
             <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-lg font-semibold">Authentication Required</p>
                    <p className="text-sm">You must be logged in to request a revision.</p>
                    {/* Redirect back to this page after login */}
                    <Link href={`/auth/signin?redirect=/portraits/${portraitId}/revise`} passHref>
                        <Button className="mt-4">Log In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!portraitId) {
        // Handle invalid/missing portrait ID in the URL
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
                <p className="text-lg font-semibold text-destructive">Invalid Portrait ID</p>
                <p className="text-sm">Could not find the portrait ID in the URL.</p>
                 <Link href="/profile/gallery" passHref>
                    <Button variant="outline" className="mt-4">Back to Gallery</Button>
                 </Link>
            </div>
        );
    }

    // If authenticated and portraitId exists, render the form
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Revise Portrait</h1>
            <RevisionForm originalPortraitId={portraitId} userId={user.id} />
        </div>
    );
} 