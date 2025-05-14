"use client"; // ContentLoader likely uses client-side features or hooks

import { ContentLoader } from "@/components/ui/content-loader";

export default function PetsLoading() {
  return (
    <ContentLoader
      isLoading={true} // This loading.tsx is only rendered when loading
      loadingText="Loading pets section..."
      variant="pet" // Using the 'pet' variant for consistency
      size="lg"      // Make it a bit larger for a page-level loader
      fullScreen={false} // We want it contained within the page content area
      overlay={false}    // No overlay, just the loader itself
      className="min-h-[calc(100vh-200px)] flex items-center justify-center" // Adjust minHeight as needed
    >
      {/* Children are not strictly needed here as ContentLoader handles the loading UI based on isLoading=true */}
      {/* However, ContentLoader expects children, so provide a placeholder if necessary or adjust ContentLoader */}
      <div /> 
    </ContentLoader>
  );
} 