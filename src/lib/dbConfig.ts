import { VercelPoolClient } from '@vercel/postgres';

// Database configuration options
export const dbConfig = {
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: true,
  sslmode: 'require',
};

// Helper function to handle database errors
export function handleDbError(error: Error & { code?: string }, operation: string) {
  console.error(`Database error during ${operation}:`, error);
  
  // Check for common error types
  if (error.code === '28P01') {
    return new Error('Authentication failed. Check database credentials.');
  } else if (error.code === '3D000') {
    return new Error('Database does not exist.');
  } else if (error.code === '42P01') {
    return new Error('Table does not exist. Run setup first.');
  } else if (error.code === '42703') {
    return new Error('Column does not exist.');
  }
  
  // Return a generic error message
  return new Error(`Database error: ${error.message || 'Unknown error'}`);
}

// Connection pool management
const connectionPool: { [key: string]: Promise<VercelPoolClient> } = {};

export function getConnectionPool(name = 'default') {
  if (!connectionPool[name]) {
    // This would be where we'd initialize a custom connection pool
    // But @vercel/postgres handles pooling for us
    console.log('Using Vercel Postgres connection pool');
  }
  return connectionPool[name];
} 