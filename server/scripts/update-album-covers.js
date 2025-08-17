require('dotenv').config();
const spotifyAPI = require('../config/spotify');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updateAlbumCovers() {
  try {
    console.log('🎵 Starting to update album covers from Spotify...');
    
    // Get all songs from the database
    const result = await pool.query('SELECT id, title, artist FROM songs');
    const songs = result.rows;
    
    console.log(`Found ${songs.length} songs to update`);
    
    for (const song of songs) {
      try {
        console.log(`\n🔍 Searching for: "${song.title}" by ${song.artist}`);
        
        // Search Spotify for the track
        const searchQuery = `${song.title} ${song.artist}`;
        const spotifyResults = await spotifyAPI.searchTracks(searchQuery, 1);
        
        if (spotifyResults.length > 0) {
          const spotifyTrack = spotifyResults[0];
          
          if (spotifyTrack.album_art_url) {
            // Update the database with real album art and preview URL
            console.log(`🔍 Preview URL for ${song.title}: ${spotifyTrack.preview_url}`);
            
            await pool.query(
              'UPDATE songs SET album_art_url = $1, preview_url = $2 WHERE id = $3',
              [spotifyTrack.album_art_url, spotifyTrack.preview_url, song.id]
            );
            
            console.log(`✅ Updated: ${song.title} - ${spotifyTrack.album_art_url}`);
          } else {
            console.log(`⚠️  No album art found for: ${song.title}`);
          }
        } else {
          console.log(`❌ No Spotify results for: ${song.title}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error updating ${song.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Album cover update completed!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
updateAlbumCovers(); 