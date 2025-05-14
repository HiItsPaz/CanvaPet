"use client";

import { ProcessingStateControls } from '@/hooks/use-processing-state';

/**
 * Interface for fetch options with progress tracking
 */
export interface ProgressFetchOptions extends RequestInit {
  // Callback for tracking upload progress
  onUploadProgress?: (progress: number) => void;
  // Callback for tracking download progress
  onDownloadProgress?: (progress: number) => void;
  // Timeout in milliseconds
  timeout?: number;
}

/**
 * Performs a fetch request with progress tracking for both upload and download
 */
export async function fetchWithProgress(
  url: string, 
  options: ProgressFetchOptions = {}
): Promise<Response> {
  const {
    onUploadProgress,
    onDownloadProgress,
    timeout,
    ...fetchOptions
  } = options;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | undefined;
  
  if (timeout) {
    timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
  }
  
  try {
    // Handle request body with upload progress if needed
    if (onUploadProgress && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
      const originalBody = fetchOptions.body;
      
      // Convert body to string if it's not already
      const bodyStr = originalBody instanceof ReadableStream
        ? undefined // Skip ReadableStream - can't easily track progress
        : typeof originalBody === 'string'
          ? originalBody
          : JSON.stringify(originalBody);
          
      // Calculate total size
      const totalSize = bodyStr 
        ? new Blob([bodyStr]).size 
        : undefined;
      
      if (bodyStr && totalSize) {
        let uploadedSize = 0;
        
        // Create a readable stream that reports progress
        const readable = new ReadableStream({
          start(controller) {
            // Break the data into chunks and report progress
            const chunkSize = 16384; // 16KB chunks
            let offset = 0;
            
            while (offset < totalSize) {
              const end = Math.min(offset + chunkSize, totalSize);
              const chunk = bodyStr.slice(offset, end);
              
              controller.enqueue(new TextEncoder().encode(chunk));
              
              offset = end;
              uploadedSize = offset;
              
              // Report upload progress
              if (onUploadProgress) {
                onUploadProgress(Math.round((uploadedSize / totalSize) * 100));
              }
            }
            
            controller.close();
          }
        });
        
        // Update request body
        fetchOptions.body = readable;
      }
    }
    
    // Handle FormData with upload progress
    if (onUploadProgress && fetchOptions.body instanceof FormData) {
      const formData = fetchOptions.body as FormData;
      const xhr = new XMLHttpRequest();
      
      // Return a promise that resolves with a Response object
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onUploadProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onUploadProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          const response = new Response(xhr.response, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(
              xhr.getAllResponseHeaders()
                .split('\\r\\n')
                .reduce((headers: Record<string, string>, line) => {
                  const parts = line.split(': ');
                  if (parts.length === 2) {
                    headers[parts[0]] = parts[1];
                  }
                  return headers;
                }, {})
            )
          });
          
          resolve(response);
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Request aborted'));
        });
        
        xhr.addEventListener('timeout', () => {
          reject(new Error('Request timed out'));
        });
        
        xhr.open(fetchOptions.method || 'GET', url);
        
        // Set request headers
        if (fetchOptions.headers) {
          const headers = new Headers(fetchOptions.headers);
          headers.forEach((value, key) => {
            xhr.setRequestHeader(key, value);
          });
        }
        
        xhr.timeout = timeout || 0;
        xhr.responseType = 'blob';
        xhr.send(formData);
      });
    }
    
    // Make the fetch request
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    // Handle download progress if needed
    if (onDownloadProgress) {
      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : undefined;
      
      if (totalSize) {
        let receivedSize = 0;
        
        // Clone the response to avoid consuming it
        const clonedResponse = response.clone();
        
        // Create a readable stream that reports progress
        const reader = clonedResponse.body?.getReader();
        const chunks: Uint8Array[] = [];
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            chunks.push(value);
            receivedSize += value.length;
            
            // Report download progress
            if (onDownloadProgress) {
              onDownloadProgress(Math.round((receivedSize / totalSize) * 100));
            }
          }
        }
      }
    }
    
    return response;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Uploads a file with progress tracking
 */
export async function uploadFileWithProgress(
  url: string,
  file: File,
  controls: ProcessingStateControls,
  additionalFormData?: Record<string, string | Blob>,
  fetchOptions: Omit<ProgressFetchOptions, 'body' | 'onUploadProgress'> = {}
): Promise<Response> {
  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional form data if provided
  if (additionalFormData) {
    Object.entries(additionalFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  // Update message to show file upload
  controls.updateProgress(0, `Uploading ${file.name}...`);
  
  // Make request with progress tracking
  const response = await fetchWithProgress(url, {
    method: 'POST',
    body: formData,
    onUploadProgress: (progress) => {
      controls.updateProgress(progress, `Uploading ${file.name}... ${progress}%`);
    },
    ...fetchOptions
  });
  
  // Process response
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response;
}

/**
 * Processes an API request with progress tracking
 */
export async function processApiRequest<T>(
  url: string,
  controls: ProcessingStateControls,
  options: {
    method?: string;
    body?: any;
    headers?: HeadersInit;
    progressMessage?: string;
    successMessage?: string;
    parseJson?: boolean;
  } = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    progressMessage = 'Processing request...',
    successMessage = 'Request completed successfully!',
    parseJson = true
  } = options;
  
  // Set initial progress
  controls.updateProgress(10, progressMessage);
  
  // Prepare headers with content type if needed
  const requestHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  
  if (body && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  
  // Make request
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData 
      ? body 
      : typeof body === 'string' 
        ? body 
        : body ? JSON.stringify(body) : undefined
  });
  
  // Handle non-OK responses
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  // Simulate processing time with progress
  controls.updateProgress(60, progressMessage);
  
  // Parse response
  let result: T;
  if (parseJson) {
    result = await response.json();
  } else {
    result = await response.text() as unknown as T;
  }
  
  // Complete processing
  controls.completeProcessing(result, successMessage);
  
  return result;
}

/**
 * Simulates a long-running process with regular progress updates
 * Useful for testing and demonstrations
 */
export async function simulateProcessing(
  controls: ProcessingStateControls,
  options: {
    durationMs?: number;
    successProbability?: number;
    progressSteps?: number;
    initialMessage?: string;
    progressMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    result?: any;
  } = {}
): Promise<any> {
  const {
    durationMs = 3000,
    successProbability = 0.9,
    progressSteps = 10,
    initialMessage = 'Starting process...',
    progressMessage = 'Processing...',
    successMessage = 'Process completed successfully!',
    errorMessage = 'Process failed!',
    result = { success: true }
  } = options;
  
  return new Promise((resolve, reject) => {
    // Start processing
    controls.updateProgress(0, initialMessage);
    
    const stepDuration = durationMs / progressSteps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.round((currentStep / progressSteps) * 100);
      
      controls.updateProgress(
        progress,
        `${progressMessage} ${progress}%`
      );
      
      if (currentStep >= progressSteps) {
        clearInterval(interval);
        
        // Determine if the process succeeds or fails
        if (Math.random() < successProbability) {
          controls.completeProcessing(result, successMessage);
          resolve(result);
        } else {
          controls.failProcessing(new Error('Simulated failure'), errorMessage);
          reject(new Error('Simulated failure'));
        }
      }
    }, stepDuration);
  });
} 