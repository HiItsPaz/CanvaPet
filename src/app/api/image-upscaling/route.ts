import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { upscaleImage, getJobStatus } from '@/lib/ai/replicate';
import { getImageDimensions, calculateScaleFactor } from '@/lib/imageUtils';

export const runtime = 'nodejs';
export const maxDuration = 10; // Set max duration for initiating, not polling

// Define target resolutions (example)
const TARGET_RESOLUTIONS = {
  '4k': 3840, // Target longer edge
  'print-8x10-300dpi': 3000, // 10 inches * 300 DPI
  'print-16x20-300dpi': 6000, // 20 inches * 300 DPI
  'default': 2048 // Default target if not specified
};

/**
 * POST handler for initiating image upscaling
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const {
      imageUrl,
      portraitId,
      petId,
      targetResolutionKey = 'default', // e.g., '4k', 'print-8x10-300dpi'
      prompting,
      seed
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Verify ownership if portraitId or petId is provided (simplified)
    // Add actual checks similar to previous implementation
    if (portraitId) console.log(`Upscaling for portrait: ${portraitId}`);
    if (petId) console.log(`Upscaling for pet: ${petId}`);

    // 1. Get original dimensions
    const dimensions = await getImageDimensions(imageUrl);
    if (!dimensions) {
      return NextResponse.json({ error: 'Could not determine original image dimensions' }, { status: 400 });
    }

    // 2. Determine target width based on key
    const targetWidth = TARGET_RESOLUTIONS[targetResolutionKey as keyof typeof TARGET_RESOLUTIONS] || TARGET_RESOLUTIONS.default;

    // 3. Calculate scale factor
    const calculatedScaleFactor = calculateScaleFactor(dimensions.width, dimensions.height, targetWidth);

    console.log(`Image: ${imageUrl}, Original Dims: ${dimensions.width}x${dimensions.height}, Target: ${targetResolutionKey} (${targetWidth}px), Calculated Scale: ${calculatedScaleFactor}x`);

    // If no upscaling is needed, maybe return original URL or a specific status?
    if (calculatedScaleFactor <= 1) {
       console.log('Upscaling not needed.');
       // Option 1: Return original URL
       // return NextResponse.json({ jobId: `no_upscale_${Date.now()}`, status: 'completed', outputUrl: imageUrl });
       // Option 2: Return a specific message/status
       return NextResponse.json({ message: 'Image is already at or above target resolution. No upscaling performed.', status: 'skipped'}, { status: 200 });
    }
    
    // Call the upscaling service with the *calculated* scale factor
    const upscalingParams = {
      userId,
      imageUrl,
      portraitId,
      petId,
      scaleFactor: calculatedScaleFactor, // Use calculated factor
      prompting,
      seed
    };

    const result = await upscaleImage(upscalingParams);
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Image upscaling error:', error);
    // Type guard for custom error properties
    const hasCustomProps = (err: unknown): err is { isRateLimited?: boolean; isCircuitOpen?: boolean; message?: string; retryAfter?: number } => {
      return typeof err === 'object' && err !== null;
    };

    if (hasCustomProps(error)) {
      if (error.isRateLimited) {
        return NextResponse.json({ error: error.message, retryAfter: error.retryAfter }, { status: 429 });
      }
      if (error.isCircuitOpen) {
        return NextResponse.json({ error: error.message, retryAfter: error.retryAfter }, { status: 503 });
      }
      return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
    } else if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * GET handler for checking upscaling job status
 */
export async function GET(req: NextRequest) {
  try {
    // Get jobId from query string
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Get job status
    const status = getJobStatus(jobId);
    
    if (!status) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(status);
    
  } catch (error: unknown) {
    console.error('Job status check error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'An unexpected error occurred' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 