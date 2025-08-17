const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'jamduel',
  port: process.env.DB_PORT || 5432,
});

async function setupYouTubeCache() {
  try {
    console.log('🚀 Setting up YouTube cache table...');
    
    // Create the cache table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS youtube_cache (
        id SERIAL PRIMARY KEY,
        song_title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        video_id VARCHAR(20),
        thumbnail_url TEXT,
        title VARCHAR(500),
        channel_title VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(song_title, artist)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Cache table created successfully');
    
    // Create indexes
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_youtube_cache_lookup ON youtube_cache(song_title, artist);',
      'CREATE INDEX IF NOT EXISTS idx_youtube_cache_created ON youtube_cache(created_at);'
    ];
    
    for (const query of indexQueries) {
      await pool.query(query);
    }
    console.log('✅ Indexes created successfully');
    
    // Add table comment
    await pool.query(`
      COMMENT ON TABLE youtube_cache IS 'Cache for YouTube video data to reduce API calls. Data expires after 24 hours.';
    `);
    console.log('✅ Table comment added');
    
    console.log('🎉 YouTube cache setup completed successfully!');
    console.log('📊 Your app will now cache YouTube data for 24 hours, reducing API calls significantly!');
    
  } catch (error) {
    console.error('❌ Error setting up YouTube cache:', error);
  } finally {
    await pool.end();
  }
}

setupYouTubeCache(); 