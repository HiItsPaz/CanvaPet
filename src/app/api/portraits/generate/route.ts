import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generatePortrait } from '@/lib/ai/openai';

export const runtime = 'nodejs';
export const maxDuration = 10; // Set max duration to 10 seconds

export async function POST(req: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient();
    
    // Get the current user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse the request body
    const body = await req.json();
    const { petId, artStyle, background, backgroundOption, orientation, styleIntensity, accessories, colorPalette, textOverlay } = body;
    
    // Validate required parameters
    if (!petId) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 });
    }
    
    if (!artStyle) {
      return NextResponse.json({ error: 'Art style is required' }, { status: 400 });
    }
    
    if (!background) {
      return NextResponse.json({ error: 'Background is required' }, { status: 400 });
    }
    
    // Fetch pet details to ensure it belongs to the user
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('user_id', userId)
      .single();
      
    if (petError || !pet) {
      return NextResponse.json({ error: 'Pet not found or access denied' }, { status: 404 });
    }
    
    // Call the portrait generation service
    const portraitParams = {
      petId,
      userId,
      artStyle,
      background,
      backgroundOption: backgroundOption || 'default',
      orientation: orientation || 'portrait',
      styleIntensity: styleIntensity || 0.75,
      accessories: accessories || [],
      colorPalette,
      textOverlay
    };
    
    const result = await generatePortrait(portraitParams);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Portrait generation error:', error);
    
    // Handle rate limiting errors
    if (error.isRateLimited) {
      return NextResponse.json(
        { error: error.message, retryAfter: error.retryAfter },
        { status: 429 }
      );
    }
    
    // Handle circuit breaker errors
    if (error.isCircuitOpen) {
      return NextResponse.json(
        { error: error.message, retryAfter: error.retryAfter },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 