import { getCelebrities, createCelebrity } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const celebrities = await getCelebrities();
    return NextResponse.json(celebrities);
  } catch (error) {
    console.error('Error fetching celebrities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch celebrities' },
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
        { error: 'Name and sport are required fields' },
        { status: 400 }
      );
    }
    
    const celebrity = await createCelebrity({
      name,
      sport,
      description
    });
    
    return NextResponse.json(celebrity, { status: 201 });
  } catch (error) {
    console.error('Error creating celebrity:', error);
    return NextResponse.json(
      { error: 'Failed to create celebrity' },
      { status: 500 }
    );
  }
} 