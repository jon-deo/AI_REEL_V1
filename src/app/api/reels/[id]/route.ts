import { getReelById } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const reel = await getReelById(id);
    
    if (!reel) {
      return NextResponse.json(
        { error: 'Reel not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(reel);
  } catch (error) {
    console.error(`Error fetching reel with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch reel' },
      { status: 500 }
    );
  }
} 