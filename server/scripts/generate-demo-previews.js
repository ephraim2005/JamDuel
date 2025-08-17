const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function generateDemoPreviews() {
  try {
    console.log('🎵 Generating demo preview URLs for songs...');
    
    // Get all songs that don't have preview URLs
    const result = await pool.query('SELECT id, title, artist FROM songs WHERE preview_url IS NULL OR preview_url = \'\'');
    const songs = result.rows;
    
    console.log(`Found ${songs.length} songs without preview URLs`);
    
    // Demo preview URLs - these are placeholder URLs that would point to actual audio files
    const demoPreviewUrls = [
      'https://example.com/demo/bohemian-rhapsody.mp3',
      'https://example.com/demo/hotel-california.mp3',
      'https://example.com/demo/imagine.mp3',
      'https://example.com/demo/stairway-to-heaven.mp3',
      'https://example.com/demo/shivers.mp3',
      'https://example.com/demo/flowers.mp3',
      'https://example.com/demo/anti-hero.mp3',
      'https://example.com/demo/as-it-was.mp3',
      'https://example.com/demo/bad-habit.mp3',
      'https://example.com/demo/good-4-u.mp3'
    ];
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const demoUrl = demoPreviewUrls[i] || demoPreviewUrls[0];
      
      try {
        // Update the song with a demo preview URL
        await pool.query(
          'UPDATE songs SET preview_url = $1 WHERE id = $2',
          [demoUrl, song.id]
        );
        
        console.log(`✅ Added demo preview for: ${song.title} - ${demoUrl}`);
      } catch (error) {
        console.error(`❌ Error updating ${song.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Demo preview URLs generated!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
generateDemoPreviews(); 