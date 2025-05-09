/**
 * Replicate Service for Image Upscaling
 * 
 * This service handles interactions with Replicate's API for upscaling images
 * using the Clarity Upscaler model.
 */

import { getReplicateConfig, checkRateLimit, checkCircuitBreaker, recordOutcome, getRateLimitWaitTime } from './config';
import { supabase } from '@/lib/supabase';

// Types
export interface UpscalingParameters {
  userId: string;
  imageUrl: string; // Source image URL
  portraitId?: string; // If upscaling a portrait
  petId?: string; // If upscaling a pet image
  scaleFactor?: number; // Default is 2
  prompting?: boolean; // Whether to use prompt guidance
  seed?: number; // Random seed for reproducibility
}

export interface UpscalingResponse {
  jobId: string;
  status: string;
  outputUrl?: string | null;
  estimatedCompletionTime?: number;
}

export interface UpscalingError {
  message: string;
  code: string;
  retryAfter?: number;
  isRateLimited?: boolean;
  isCircuitOpen?: boolean;
}

// Default Clarity Upscaler model parameters
const DEFAULT_UPSCALING_PARAMS = {
  seed: 1337,
  prompt: "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
  dynamic: 6,
  scheduler: "DPM++ 3M SDE Karras",
  creativity: 0.35,
  resemblance: 0.6,
  scale_factor: 2,
  negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
  num_inference_steps: 18
};

/**
 * Create a unique job ID
 */
function generateJobId(): string {
  return `clarity-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Track in-progress jobs
 */
interface JobState {
  jobId: string;
  prediction_id?: string;
  status: string;
  imageUrl: string;
  outputUrl?: string;
  userId: string;
  portraitId?: string;
  petId?: string;
  startTime: number;
  lastUpdated: number;
}

const jobStates: Record<string, JobState> = {};

// Helper function to fetch and merge JSONB data (could be shared with openai.ts)
// For simplicity, duplicated here. Consider moving to a shared DB utils file.
async function mergeImageVersions(id: string, newVersions: Record<string, string>, tableName: 'portraits' | 'pets'): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from(tableName)
    .select('image_versions') // Assuming pets table also gets image_versions
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching existing image versions for ${tableName} ${id}:`, error);
    return newVersions;
  }

  const existingVersions = data?.image_versions || {};
  return { ...existingVersions, ...newVersions };
}

/**
 * Start a job to upscale an image using Clarity Upscaler
 */
export async function upscaleImage(params: UpscalingParameters): Promise<UpscalingResponse> {
  try {
    // Check circuit breaker
    if (!checkCircuitBreaker('replicate')) {
      const error: UpscalingError = {
        message: 'Service temporarily unavailable due to multiple failures. Try again later.',
        code: 'circuit_open',
        isCircuitOpen: true,
        retryAfter: 30 // seconds
      };
      throw error;
    }
    
    // Check rate limiting
    if (!checkRateLimit('replicate')) {
      const waitTime = getRateLimitWaitTime('replicate');
      const error: UpscalingError = {
        message: 'Rate limit exceeded. Please try again later.',
        code: 'rate_limited',
        isRateLimited: true,
        retryAfter: Math.ceil(waitTime / 1000) // convert ms to seconds
      };
      throw error;
    }
    
    // Create a job ID
    const jobId = generateJobId();
    
    // Initialize job state
    jobStates[jobId] = {
      jobId,
      status: 'pending',
      imageUrl: params.imageUrl,
      userId: params.userId,
      portraitId: params.portraitId,
      petId: params.petId,
      startTime: Date.now(),
      lastUpdated: Date.now()
    };
    
    // Start async processing in background
    // This allows us to return immediately while processing continues
    processImageUpscaling(jobId, params)
      .catch(error => {
        console.error('Background image upscaling failed:', error);
        // Update job status
        if (jobStates[jobId]) {
          jobStates[jobId].status = 'failed';
          jobStates[jobId].lastUpdated = Date.now();
        }
      });
    
    // Return immediately with the job ID and pending status
    return {
      jobId,
      status: 'pending',
      estimatedCompletionTime: 120 // seconds, approximate time for upscaling
    };
  } catch (error: any) {
    console.error('Image upscaling initiation failed:', error);
    
    // If this is an expected error type, throw it directly
    if (error.code && (error.isRateLimited || error.isCircuitOpen)) {
      throw error;
    }
    
    // Otherwise, throw a generic error
    throw {
      message: `Failed to initiate image upscaling: ${error.message}`,
      code: 'upscaling_failed'
    };
  }
}

/**
 * Background processing function for image upscaling
 * This runs asynchronously after the API call returns
 */
async function processImageUpscaling(
  jobId: string,
  params: UpscalingParameters
): Promise<void> {
  const config = getReplicateConfig();
  let upscaledPublicUrl: string | null = null;

  try {
    // Set status to processing
    jobStates[jobId].status = 'processing';
    jobStates[jobId].lastUpdated = Date.now();

    // Configure upscaling parameters for Replicate
    const upscalingParams = {
      ...DEFAULT_UPSCALING_PARAMS,
      image: params.imageUrl,
      scale_factor: params.scaleFactor || 2, // Use calculated or default scale
      seed: params.seed || DEFAULT_UPSCALING_PARAMS.seed
    };
    if (params.prompting === false) {
      upscalingParams.prompt = "";
      upscalingParams.negative_prompt = "";
    }

    // 1. Call Replicate API to start prediction
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: config.clarityUpscalerModel,
        input: upscalingParams
      })
    });
    if (!startResponse.ok) {
      const errorData = await startResponse.json();
      throw new Error(`Replicate API error: ${errorData.detail || startResponse.statusText}`);
    }
    const prediction = await startResponse.json();
    if (!prediction.id) {
      throw new Error('Replicate did not return a prediction ID');
    }
    jobStates[jobId].prediction_id = prediction.id;
    
    // 2. Poll for results
    const upscaledImageUrl = await pollForResults(jobId, prediction.id, config.apiKey, config.timeout);
    if (!upscaledImageUrl) {
      throw new Error('Failed to get upscaled image URL from Replicate after polling');
    }

    // 3. Download the upscaled image
    const imageResponse = await fetch(upscaledImageUrl);
    if (!imageResponse.ok) {
        throw new Error(`Failed to download upscaled image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    // 4. Determine storage path and target record
    const fileExt = 'png'; // Assume upscaler output format
    let baseStoragePath = `unknown/${params.userId}`;
    let targetTable: 'portraits' | 'pets' | null = null;
    let targetId: string | null = null;
    let versionKey = `upscaled_clarity_${params.scaleFactor || 2}x`;

    if (params.portraitId) {
        baseStoragePath = `portraits/${params.portraitId}`;
        targetTable = 'portraits';
        targetId = params.portraitId;
    } else if (params.petId) {
        // Assuming pets table will also have image_versions column
        baseStoragePath = `pets/${params.petId}`;
        targetTable = 'pets';
        targetId = params.petId;
    }
    const storagePath = `${baseStoragePath}/${versionKey}.${fileExt}`;

    // 5. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('generated-images') // Use a consistent bucket
      .upload(storagePath, imageBlob, { contentType: 'image/png', cacheControl: '3600' });
    if (uploadError) {
      // Handle potential conflict if file exists? Or rely on bucket policies?
      console.error(`Supabase upload error: ${uploadError.message}`);
      throw new Error(`Failed to upload upscaled image: ${uploadError.message}`);
    }

    // 6. Get public URL
    const { data: urlData } = supabase.storage.from('generated-images').getPublicUrl(storagePath);
    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL after upload.');
    }
    upscaledPublicUrl = urlData.publicUrl;

    // 7. Update job state (in memory)
    jobStates[jobId].status = 'completed';
    jobStates[jobId].outputUrl = upscaledPublicUrl;
    jobStates[jobId].lastUpdated = Date.now();

    // 8. Update the target database record (portraits or pets)
    if (targetTable && targetId) {
       const newVersionData = { [versionKey]: upscaledPublicUrl };
       const mergedVersions = await mergeImageVersions(targetId, newVersionData, targetTable);
       
       const { error: dbUpdateError } = await supabase
        .from(targetTable)
        .update({
          image_versions: mergedVersions,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);
        
       if (dbUpdateError) {
            console.error(`Failed to update ${targetTable} record ${targetId} with upscaled URL:`, dbUpdateError);
            // Decide how to handle this - job completed but DB update failed?
            // Maybe retry DB update later? For now, log and continue.
            // Could potentially update job state to 'completed_with_db_error'
       }
    }

    // 9. Record success for circuit breaker
    recordOutcome('replicate', true);

  } catch (error: any) {
    console.error(`Image upscaling processing failed for job ${jobId}:`, error);
    recordOutcome('replicate', false);
    if (jobStates[jobId]) {
      jobStates[jobId].status = 'failed';
      jobStates[jobId].lastUpdated = Date.now();
      // Optionally store error message in job state if needed
    }
    // Do not re-throw here, failure is recorded in job state
  }
}

/**
 * Poll for results from Replicate
 */
async function pollForResults(
  jobId: string, 
  predictionId: string, 
  apiKey: string, 
  timeout: number
): Promise<string | null> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds
  
  while (Date.now() - startTime < timeout) {
    // Update last updated time
    jobStates[jobId].lastUpdated = Date.now();
    
    // Get prediction status
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Replicate API error: ${errorData.detail || response.statusText}`);
    }
    
    const prediction = await response.json();
    
    // Check status
    if (prediction.status === 'succeeded') {
      // Return the output image URL
      return prediction.output || null;
    } else if (prediction.status === 'failed') {
      throw new Error(`Replicate prediction failed: ${prediction.error || 'Unknown error'}`);
    } else if (prediction.status === 'canceled') {
      throw new Error('Replicate prediction was canceled');
    }
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  // If we reach here, the timeout was exceeded
  throw new Error('Timeout waiting for Replicate prediction result');
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): UpscalingResponse | null {
  const job = jobStates[jobId];
  
  if (!job) {
    return null;
  }
  
  return {
    jobId: job.jobId,
    status: job.status,
    outputUrl: job.outputUrl,
    estimatedCompletionTime: job.status === 'pending' ? 120 : 
                            job.status === 'processing' ? 
                            Math.max(0, 120 - Math.floor((Date.now() - job.startTime) / 1000)) : 
                            0
  };
}

/**
 * Clean up old jobs (call this periodically)
 */
export function cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  
  Object.keys(jobStates).forEach(jobId => {
    const job = jobStates[jobId];
    
    // Remove jobs that are complete or failed and older than maxAgeMs
    if ((job.status === 'completed' || job.status === 'failed') && 
        now - job.lastUpdated > maxAgeMs) {
      delete jobStates[jobId];
    }
  });
} 