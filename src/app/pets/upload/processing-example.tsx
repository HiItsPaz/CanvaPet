"use client";

import { useState, useRef } from 'react';
import { 
  ProcessingStateProvider 
} from '@/components/ui/processing-state-provider';
import { useProcessingState } from '@/hooks/use-processing-state';
import { 
  uploadFileWithProgress, 
  processApiRequest, 
  simulateProcessing 
} from '@/lib/api/processing-utils';
import { Button } from '@/components/ui/button';

export interface UploadProcessingExampleProps {
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Example component demonstrating integration of ProcessingStateProvider
 * with file uploads and API processing
 */
export function UploadProcessingExample({ 
  onComplete, 
  onError 
}: UploadProcessingExampleProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingState, processingControls] = useProcessingState({
    initialMessage: 'Select a file to upload',
    processingMessage: 'Processing your file...',
    successMessage: 'File processed successfully!',
    errorMessage: 'Error processing file',
    autoReset: true,
    resetDelay: 5000,
    onSuccess: onComplete,
    onError
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };
  
  // Trigger file browser
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process the file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      processingControls.failProcessing('No file selected', 'Please select a file first');
      return;
    }
    
    try {
      // Start processing
      processingControls.startProcessing();
      
      // For demo purposes, we'll use the simulation function
      // In a real implementation, this would be an actual API endpoint
      // Example with a real API endpoint:
      // const response = await uploadFileWithProgress(
      //   '/api/pets/upload',
      //   selectedFile,
      //   processingControls
      // );
      // 
      // const result = await response.json();
      // processingControls.completeProcessing(result, 'File uploaded successfully!');

      // Using simulation for demo
      await simulateProcessing(processingControls, {
        durationMs: 5000,
        progressSteps: 20,
        initialMessage: `Preparing ${selectedFile.name} for upload...`,
        progressMessage: `Processing ${selectedFile.name}`,
        successMessage: `${selectedFile.name} processed successfully!`,
        result: { fileName: selectedFile.name, id: Math.random().toString(36).substring(7) }
      });
      
      // Reset selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Error is already handled by simulateProcessing
    }
  };
  
  // Cancel the upload
  const handleCancel = () => {
    processingControls.cancel();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="upload-processing-example bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload & Process Your Pet Image</h2>
      
      {/* Processing Animation */}
      <div className="mb-6">
        <ProcessingStateProvider
          options={{
            initialMessage: 'Select a file to upload',
            processingMessage: 'Processing your file...',
            successMessage: 'File processed successfully!',
            errorMessage: 'Error processing file',
            autoReset: true,
            resetDelay: 5000,
            onSuccess: onComplete,
            onError
          }}
          size="md"
          className="mx-auto"
        >
          {/* No children needed as ProcessingStateProvider will show animation */}
        </ProcessingStateProvider>
      </div>
      
      {/* File Selection Area */}
      <div className={`mb-6 ${processingState.isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <div 
            className="w-full text-center" 
            onClick={handleSelectFile}
          >
            {selectedFile ? (
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">Click to select a file</p>
                <p className="text-sm text-gray-500">
                  or drag and drop image here
                </p>
              </div>
            )}
          </div>
        </div>
        
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-500">
            File selected: {selectedFile.name}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || processingState.isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Upload & Process
        </Button>
        
        {processingState.isProcessing && (
          <Button
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
} 