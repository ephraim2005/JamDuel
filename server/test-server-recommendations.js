const pool = require('./config/database');
const { generateRecommendations } = require('./routes/recommendations');
require('dotenv').config();

async function testServerRecommendations() {
  try {
    console.log('🎵 Testing Server Recommendations System...');
    
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('❌ Please set OPENAI_API_KEY in your .env file');
      return;
    }

    console.log('✅ OpenAI API key found');
    
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', dbTest.rows[0].now);
    
    // Get user's actual favorite songs from database
    console.log('📊 Fetching user songs from database...');
    const userSongs = await pool.query(`
      SELECT s.title, s.artist, s.genre
      FROM user_songs us
      JOIN songs s ON us.song_id = s.id
      WHERE us.user_id = 2
      ORDER BY us.created_at DESC
      LIMIT 10
    `);
    
    console.log(`✅ Found ${userSongs.rows.length} songs for user ID 2`);
    console.log('📝 Songs:', userSongs.rows.map(s => `${s.title} by ${s.artist}`).join(', '));
    
    // Generate recommendations
    console.log('🤖 Generating GPT-4 recommendations...');
    const recommendations = await generateRecommendations(userSongs.rows);
    
    console.log('🎉 Recommendations generated successfully!');
    console.log('📊 Categories:', Object.keys(recommendations));
    
    // Save recommendations to database
    console.log('💾 Saving recommendations to database...');
    
    // Clear existing recommendations
    await pool.query('DELETE FROM user_recommendations WHERE user_id = 2');
    
    // Insert new recommendations
    for (const [category, songs] of Object.entries(recommendations)) {
      for (const song of songs) {
        // Check if song exists, if not create it
        let songResult = await pool.query(
          'SELECT id FROM songs WHERE LOWER(title) = LOWER($1) AND LOWER(artist) = LOWER($2)',
          [song.title, song.artist]
        );

        let songId;
        if (songResult.rows.length > 0) {
          songId = songResult.rows[0].id;
        } else {
          // Create new song with generated spotify_id
          const generatedSpotifyId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newSong = await pool.query(
            'INSERT INTO songs (spotify_id, title, artist, genre, album_art_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [generatedSpotifyId, song.title, song.artist, song.genre, 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=🎵']
          );
          songId = newSong.rows[0].id;
        }

        // Save recommendation
        await pool.query(
          'INSERT INTO user_recommendations (user_id, song_id, category, reason) VALUES ($1, $2, $3, $4)',
          [2, songId, category, song.reason]
        );
      }
    }
    
    console.log('✅ Recommendations saved to database successfully!');
    
    // Verify they were saved
    const savedRecs = await pool.query('SELECT COUNT(*) FROM user_recommendations WHERE user_id = 2');
    console.log(`📊 Total recommendations saved: ${savedRecs.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error testing server recommendations:', error);
  } finally {
    await pool.end();
  }
}

testServerRecommendations(); 