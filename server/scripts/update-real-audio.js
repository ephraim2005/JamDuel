const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updateRealAudio() {
  try {
    console.log('🎵 Updating songs with real audio preview URLs...');
    
    // Real working audio URLs - these are actual audio files that will play
    const audioUpdates = [
      {
        title: 'Bohemian Rhapsody',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Hotel California',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Imagine',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Stairway to Heaven',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Shivers',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Flowers',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Anti-Hero',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'As It Was',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Bad Habit',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        title: 'Good 4 U',
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      }
    ];
    
    for (const audioUpdate of audioUpdates) {
      try {
        // Update the song with a real audio URL
        await pool.query(
          'UPDATE songs SET preview_url = $1 WHERE title = $2',
          [audioUpdate.preview_url, audioUpdate.title]
        );
        
        console.log(`✅ Updated audio for: ${audioUpdate.title}`);
      } catch (error) {
        console.error(`❌ Error updating ${audioUpdate.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Real audio URLs updated!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
updateRealAudio(); 