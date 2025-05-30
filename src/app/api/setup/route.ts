import { createTables, testConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First test the connection
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({ 
        message: 'Database connection failed', 
        error: connectionTest.error 
      }, { status: 500 });
    }
    
    // Then create tables
    const result = await createTables();
    
    if (!result.success) {
      return NextResponse.json({ 
        message: 'Error creating database tables', 
        error: result.error 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Database tables created successfully',
      connection: connectionTest.timestamp
    }, { status: 200 });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 