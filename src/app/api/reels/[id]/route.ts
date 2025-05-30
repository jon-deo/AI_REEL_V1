import { getReelById } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const reel = await getReelById(numericId);

    if (!reel) {
      return NextResponse.json(
        { error: 'Reel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reel);
  } catch (error) {
    console.error(`Error fetching reel:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch reel' },
      { status: 500 }
    );
  }
} 