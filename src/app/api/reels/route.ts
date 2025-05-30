import { getReels } from '@/lib/db';
import { generateSportsCelebrityVideo } from '@/lib/videoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const reels = await getReels();
    return NextResponse.json(reels);
  } catch (error) {
    console.error('Error fetching reels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sport, description } = body;

    if (!name || !sport) {
      return NextResponse.json(
        { error: 'Missing required fieldsssss' },
        { status: 400 }
      );
    }

    console.log('Starting video generation for:', { name, sport, description });
    const videoData = await generateSportsCelebrityVideo({
      name,
      sport,
      description
    });
    console.log('Video generation completed successfully');

    return NextResponse.json(videoData, { status: 201 });
  } catch (error) {
    console.error('Error creating reel:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Failed to create reel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 