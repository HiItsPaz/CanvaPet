import { NextRequest, NextResponse } from 'next/server';

// Simulate processing delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const options = formData.get('options') as string | null;
    
    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Simulate a slow process
    await sleep(2000);
    
    // Get file info
    const fileSize = file.size;
    const fileName = file.name;
    const fileType = file.type;
    
    // Parse options if provided
    const parsedOptions = options ? JSON.parse(options) : {};
    
    // Create a mock processed result
    const result = {
      id: Math.random().toString(36).substring(7),
      originalFileName: fileName,
      processedFileName: `processed-${fileName}`,
      fileSize,
      fileType,
      processedAt: new Date().toISOString(),
      options: parsedOptions,
      status: 'success',
      url: `/api/pets/images/${Math.random().toString(36).substring(7)}`,
    };
    
    // Return success response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error processing pet image:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

// Optional: Create a simple endpoint to get processing status
export async function GET(request: NextRequest) {
  // Get ID from the request
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Basic validation
  if (!id) {
    return NextResponse.json(
      { error: 'No ID provided' },
      { status: 400 }
    );
  }
  
  // Simulate a processing status check
  // In a real implementation, this would check a database or queue status
  
  // Generate a random progress value between 0 and 100
  const progress = Math.min(100, Math.floor(Math.random() * 100));
  
  // Return a status response
  return NextResponse.json({
    id,
    status: progress === 100 ? 'complete' : 'processing',
    progress,
    message: progress === 100 
      ? 'Processing complete' 
      : `Processing... ${progress}%`
  }, { status: 200 });
} 