"use client";

import { useState } from 'react';
import { PetPhotoUpload } from '@/components/pets/PetPhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

// Define a more specific type for metadata
type PhotoMetadata = {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  [key: string]: unknown;
};

export default function PetPhotoUploadPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PhotoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleUploadComplete = (url: string, meta?: PhotoMetadata) => {
    setUploadedUrl(url);
    setMetadata(meta || null);
    setError(null);
  };
  
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setUploadedUrl(null);
    setMetadata(null);
  };
  
  const handleReset = () => {
    setUploadedUrl(null);
    setMetadata(null);
    setError(null);
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Your Pet Photo</h1>
      
      <div className="max-w-2xl mx-auto">
        {/* Compression Notice */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Image Compression</AlertTitle>
          <AlertDescription>
            Large images will be automatically compressed to optimize storage and loading speed while maintaining quality.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Pet Photo Upload</CardTitle>
            <CardDescription>
              Upload a photo of your pet to get started. We accept JPG, PNG, WebP and HEIC files up to 10MB.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <PetPhotoUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </CardContent>
          
          {(uploadedUrl || error) && (
            <CardFooter className="flex-col items-start gap-4">
              {uploadedUrl && (
                <div className="w-full">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Check className="h-5 w-5" />
                    <p className="font-medium">Upload successful!</p>
                  </div>
                  
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="text-sm font-mono break-all">{uploadedUrl}</p>
                  </div>
                  
                  <div className="mt-4">
                    {uploadedUrl && metadata?.width && metadata?.height && (
                      <Image 
                        src={uploadedUrl} 
                        alt="Uploaded pet" 
                        width={metadata.width}
                        height={metadata.height}
                        className="w-full max-h-80 object-contain rounded-md border"
                      />
                    )}
                  </div>
                  
                  {metadata && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Image Information:</h3>
                      <div className="bg-muted p-3 rounded-md text-xs font-mono">
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}
              
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="mt-2"
              >
                Upload Another Photo
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
} 