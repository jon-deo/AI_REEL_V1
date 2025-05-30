import { sql } from '@vercel/postgres';
import { handleDbError } from './dbConfig';

// Ensure connection is using the right URL
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connection successful:', result.rows[0]);
    return { success: true, timestamp: result.rows[0] };
  } catch (error) {
    console.error('Database connection error:', error);
    const formattedError = handleDbError(error as Error, 'testing connection');
    return { success: false, error: formattedError.message };
  }
}

export async function createTables() {
  try {
    // Create celebrities table
    await sql`
      CREATE TABLE IF NOT EXISTS celebrities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sport VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create reels table
    await sql`
      CREATE TABLE IF NOT EXISTS reels (
        id SERIAL PRIMARY KEY,
        celebrity_id INTEGER REFERENCES celebrities(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'processing',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Tables created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating tables:', error);
    return { success: false, error };
  }
}

export async function getCelebrities() {
  try {
    const celebrities = await sql`SELECT * FROM celebrities ORDER BY name ASC`;
    return celebrities.rows;
  } catch (error) {
    console.error('Error fetching celebrities:', error);
    return [];
  }
}

export async function getCelebrityById(id: number) {
  try {
    const result = await sql`SELECT * FROM celebrities WHERE id = ${id}`;
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching celebrity with ID ${id}:`, error);
    return null;
  }
}

export async function getReels() {
  try {
    const reels = await sql`
      SELECT r.*, c.name as celebrity_name, c.sport 
      FROM reels r
      JOIN celebrities c ON r.celebrity_id = c.id
      WHERE r.status = 'completed'
      ORDER BY r.created_at DESC
    `;
    return reels.rows;
  } catch (error) {
    console.error('Error fetching reels:', error);
    return [];
  }
}

export async function getReelById(id: number) {
  try {
    const result = await sql`
      SELECT r.*, c.name as celebrity_name, c.sport 
      FROM reels r
      JOIN celebrities c ON r.celebrity_id = c.id
      WHERE r.id = ${id}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching reel with ID ${id}:`, error);
    return null;
  }
}

export async function createReel(data: {
  celebrity_id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
}) {
  try {
    const { celebrity_id, title, description, video_url, thumbnail_url } = data;
    const result = await sql`
      INSERT INTO reels (celebrity_id, title, description, video_url, thumbnail_url, status)
      VALUES (${celebrity_id}, ${title}, ${description}, ${video_url}, ${thumbnail_url}, 'completed')
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
}

export async function createCelebrity(data: {
  name: string;
  sport: string;
  description?: string;
}) {
  try {
    const { name, sport, description } = data;
    const result = await sql`
      INSERT INTO celebrities (name, sport, description)
      VALUES (${name}, ${sport}, ${description})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating celebrity:', error);
    throw error;
  }
}

export async function getCelebrityByNameAndSport(name: string, sport: string) {
  try {
    const result = await sql`SELECT * FROM celebrities WHERE name = ${name} AND sport = ${sport}`;
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching celebrity with name ${name} and sport ${sport}:`, error);
    return null;
  }
}

export async function updateReelStatus(reelId: number, status: string) {
  try {
    const result = await sql`
      UPDATE reels 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${reelId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating status for reel ${reelId}:`, error);
    throw error;
  }
} 