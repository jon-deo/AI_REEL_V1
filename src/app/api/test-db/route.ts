import { testConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Database connection successful', 
        timestamp: result.timestamp 
      });
    }
    
    return NextResponse.json({ 
      message: 'Database connection failed', 
      error: result.error 
    }, { status: 500 });
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error 
    }, { status: 500 });
  }
} 