"use client";

import React, { useState, useEffect } from 'react';
import { ProcessingAnimation } from './processing-animation';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface PreviewScreenProps {
  className?: string;
  onClose?: () => void;
  onRetry?: () => void;
  onContinue?: () => void;
  initialStatus?: 'initial' | 'processing' | 'complete' | 'error';
  processingTime?: number; // Simulated processing time in ms
  petName?: string;
}

export function PreviewScreen({
  className,
  onClose,
  onRetry,
  onContinue,
  initialStatus = 'initial',
  processingTime = 3000, // Default 3 seconds
  petName = 'your pet'
}: PreviewScreenProps) {
  const [status, setStatus] = useState<'initial' | 'processing' | 'complete' | 'error'>(initialStatus);
  const [message, setMessage] = useState<string>('');
  
  // Simulate processing with different states and messages
  useEffect(() => {
    const messages = {
      initial: `Getting ready to create ${petName}...`,
      processing: [
        `Processing ${petName}'s details...`,
        `Applying style to ${petName}...`,
        `Almost there, adding final touches...`
      ],
      complete: `${petName} is ready to view!`,
      error: `Oops! There was a problem creating ${petName}.`
    };
    
    // Set initial message
    setMessage(messages[status] as string);
    
    // If we're processing, simulate the steps with changing messages
    if (status === 'processing') {
      let step = 0;
      const messageInterval = setInterval(() => {
        step = (step + 1) % (messages.processing as string[]).length;
        setMessage(messages.processing[step]);
      }, processingTime / 3);
      
      // After processingTime, complete the process
      const processingTimeout = setTimeout(() => {
        clearInterval(messageInterval);
        // 90% chance of success, 10% chance of error (for testing)
        const success = Math.random() > 0.1;
        setStatus(success ? 'complete' : 'error');
        setMessage(success ? messages.complete : messages.error);
      }, processingTime);
      
      return () => {
        clearInterval(messageInterval);
        clearTimeout(processingTimeout);
      };
    }
    
    // Update message when status changes
    if (status === 'complete') {
      setMessage(messages.complete);
    } else if (status === 'error') {
      setMessage(messages.error);
    }
  }, [status, petName, processingTime]);
  
  const handleStart = () => {
    setStatus('processing');
  };
  
  const handleRetry = () => {
    setStatus('processing');
    if (onRetry) onRetry();
  };
  
  const handleContinue = () => {
    if (onContinue) onContinue();
  };
  
  return (
    <div className={cn('w-full max-w-md mx-auto p-6 rounded-lg bg-white shadow-lg', className)}>
      <div className="flex flex-col items-center">
        <ProcessingAnimation 
          status={status} 
          message={message}
          onComplete={() => {
            // Animation has completed, you can trigger additional actions here
          }}
        />
        
        <div className="mt-6 w-full flex flex-col gap-4">
          {status === 'initial' && (
            <Button 
              onClick={handleStart} 
              className="w-full"
            >
              Start Processing
            </Button>
          )}
          
          {status === 'complete' && (
            <Button 
              onClick={handleContinue} 
              className="w-full"
            >
              Continue
            </Button>
          )}
          
          {status === 'error' && (
            <>
              <Button 
                onClick={handleRetry} 
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="w-full"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 