"use client";

import PetUploadFlow from "@/components/pets/PetUploadFlow";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function PetPhotoUploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Your Pet Photo</h1>
      
      <div className="max-w-4xl mx-auto">
        {/* Compression Notice */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Image Compression</AlertTitle>
          <AlertDescription>
            Large images will be automatically compressed to optimize storage and loading speed while maintaining quality.
          </AlertDescription>
        </Alert>
        
        <PetUploadFlow />
      </div>
    </div>
  );
} 