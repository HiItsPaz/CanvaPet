"use client";

import React, { useEffect, useState } from 'react';
// No dynamic import here anymore, we'll import inside useEffect

interface ClientOnlyLottieProps {
  animationData: any; // The Lottie animation data
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function ClientOnlyLottie({ animationData, loop = true, autoplay = true, className }: ClientOnlyLottieProps) {
  const [LottieComponent, setLottieComponent] = useState<React.ComponentType<any> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Dynamically import lottie-react only on the client after mounting
    import('lottie-react').then(mod => {
      setLottieComponent(() => mod.default); // Store the Lottie component
    }).catch(error => {
      console.error('Failed to load Lottie component:', error);
      // Optionally set an error state or render a fallback
    });
  }, []);

  // Render a placeholder or null on the server and while loading client-side
  if (!isMounted || !LottieComponent) {
    return <div className={className}>Loading Animation...</div>; // Or return null
  }

  // Render Lottie on the client once the component is loaded
  return (
    <LottieComponent
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
} 