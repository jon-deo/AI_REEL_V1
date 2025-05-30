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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const videoData = await generateSportsCelebrityVideo({
      name,
      sport,
      description
    });
    
    return NextResponse.json(videoData, { status: 201 });
  } catch (error) {
    console.error('Error creating reel:', error);
    return NextResponse.json(
      { error: 'Failed to create reel' },
      { status: 500 }
    );
  }
} 