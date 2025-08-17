const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const axios = require('axios');

// Function to search for album cover from Spotify
async function searchSpotifyAlbumCover(title, artist) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: `${title} ${artist}`,
        type: 'track',
        limit: 1
      },
      headers: {
        'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.tracks && response.data.tracks.items.length > 0) {
      const track = response.data.tracks.items[0];
      if (track.album && track.album.images && track.album.images.length > 0) {
        return track.album.images[0].url; // Return the highest quality image
      }
    }
    return null;
  } catch (error) {
    console.error('Spotify API error:', error);
    return null;
  }
}

const router = express.Router();

// Get song recommendations based on user's top 10 songs
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has existing recommendations and if they're less than 24 hours old
    const existingRecs = await pool.query(`
      SELECT last_generated FROM user_recommendations 
      WHERE user_id = $1 
      ORDER BY last_generated DESC 
      LIMIT 1
    `, [userId]);

    let shouldGenerate = false;
    let hoursRemaining = 0;

    if (existingRecs.rows.length > 0) {
      const lastGenerated = new Date(existingRecs.rows[0].last_generated);
      const now = new Date();
      
      // Check if it's a new day (after midnight)
      const lastGeneratedDate = lastGenerated.toDateString();
      const currentDate = now.toDateString();
      
      if (lastGeneratedDate === currentDate) {
        // Same day - don't generate new recommendations
        shouldGenerate = false;
        
        // Calculate time until midnight
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const timeUntilMidnight = tomorrow - now;
        const hoursUntilMidnight = Math.ceil(timeUntilMidnight / (1000 * 60 * 60));
        hoursRemaining = hoursUntilMidnight;
      } else {
        // New day - generate new recommendations
        shouldGenerate = true;
      }
    } else {
      // New user - should generate recommendations
      shouldGenerate = true;
    }

    // If recommendations are fresh, return them from database
    if (!shouldGenerate) {
      const recommendations = await pool.query(`
        SELECT 
          ur.category,
          ur.reason,
          s.title,
          s.artist,
          s.genre,
          s.album_art_url
        FROM user_recommendations ur
        JOIN songs s ON ur.song_id = s.id
        WHERE ur.user_id = $1
        ORDER BY ur.category, ur.created_at
      `, [userId]);

      // Group by category
      const groupedRecommendations = {};
      recommendations.rows.forEach(rec => {
        if (!groupedRecommendations[rec.category]) {
          groupedRecommendations[rec.category] = [];
        }
        groupedRecommendations[rec.category].push({
          title: rec.title,
          artist: rec.artist,
          genre: rec.genre,
          album_art_url: rec.album_art_url,
          reason: rec.reason
        });
      });

              return res.json({ 
          recommendations: groupedRecommendations,
          shouldGenerate: false,
          hoursRemaining,
          message: 'Using existing recommendations (refreshes at midnight)'
        });
    }

    // If recommendations are old or user is new, generate new ones
    const favoriteSongs = await pool.query(`
      SELECT s.title, s.artist, s.genre
      FROM user_songs us
      JOIN songs s ON us.song_id = s.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
      LIMIT 10
    `, [userId]);

    if (favoriteSongs.rows.length === 0) {
      return res.status(404).json({ error: 'No favorite songs found' });
    }

    // Generate new recommendations
    const recommendations = await generateRecommendations(favoriteSongs.rows);
    
    // Save recommendations to database
    await saveRecommendations(userId, recommendations);

    res.json({ 
      recommendations,
      shouldGenerate: true,
      message: 'Generated new recommendations'
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Generate recommendations based on favorite songs using GPT-4
async function generateRecommendations(favoriteSongs) {
  try {
    // Create a prompt for GPT-4 based on the user's favorite songs
    const songList = favoriteSongs.map(song => `${song.title} by ${song.artist}`).join(', ');
    
    const prompt = `Based on these 10 favorite songs: ${songList}

Please provide music recommendations in the following JSON format with exactly 3 songs per category:

{
  "popularSongs": [
    {"title": "Song Title", "artist": "Artist Name", "genre": "Genre", "reason": "Why this song is recommended"}
  ],
  "undergroundGems": [
    {"title": "Song Title", "artist": "Artist Name", "genre": "Genre", "reason": "Why this song is recommended"}
  ],
  "sameArtist": [
    {"title": "Song Title", "artist": "Artist Name", "genre": "Genre", "reason": "Why this song is recommended"}
  ],
  "genreExploration": [
    {"title": "Song Title", "artist": "Artist Name", "genre": "Genre", "reason": "Why this song is recommended"}
  ]
}

Focus on:
- PopularSongs: Well-known hits that match the user's taste
- UndergroundGems: Lesser-known but high-quality songs
- SameArtist: More songs from artists the user already likes
- GenreExploration: Songs from genres they might enjoy based on their favorites

Make sure all song titles and artist names are accurate and real.`;

    // Call OpenAI GPT-4 API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a music recommendation expert. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      const recommendations = JSON.parse(content);
      
      // Validate the structure
      if (recommendations.popularSongs && recommendations.undergroundGems && 
          recommendations.sameArtist && recommendations.genreExploration) {
        return recommendations;
      } else {
        throw new Error('Invalid recommendations structure');
      }
    } catch (parseError) {
      console.error('Failed to parse GPT-4 response:', parseError);
      console.log('Raw response:', content);
      // Fallback to default recommendations
      return getDefaultRecommendations(favoriteSongs);
    }
    
  } catch (error) {
    console.error('GPT-4 API error:', error);
    // Fallback to default recommendations
    return getDefaultRecommendations(favoriteSongs);
  }
}

// Fallback recommendations if GPT-4 fails
function getDefaultRecommendations(favoriteSongs) {
  // Analyze the user's favorite songs to generate better fallback recommendations
  const artists = [...new Set(favoriteSongs.map(song => song.artist))];
  const genres = [...new Set(favoriteSongs.map(song => song.genre).filter(Boolean))];
  
  return {
    popularSongs: [
      { title: "Blinding Lights", artist: "The Weeknd", genre: "Pop", reason: "Based on your love for modern hip-hop and R&B" },
      { title: "Dance Monkey", artist: "Tones and I", genre: "Pop", reason: "Similar upbeat energy to your favorites" },
      { title: "Shape of You", artist: "Ed Sheeran", genre: "Pop", reason: "Popular hit that complements your music taste" }
    ],
    undergroundGems: [
      { title: "Motion", artist: "Calvin Harris", genre: "Electronic", reason: "Electronic elements that complement your hip-hop favorites" },
      { title: "Midnight City", artist: "M83", genre: "Electronic", reason: "Atmospheric electronic music for variety" },
      { title: "Redbone", artist: "Childish Gambino", genre: "R&B", reason: "Smooth R&B that matches your taste" }
    ],
    sameArtist: [
      { title: "No Role Modelz", artist: "J Cole", genre: "Hip-Hop", reason: "More from J Cole, who you clearly enjoy" },
      { title: "Power", artist: "Kanye West", genre: "Hip-Hop", reason: "Another Kanye West classic" },
      { title: "God's Plan", artist: "Drake", genre: "Hip-Hop", reason: "More from Drake, similar to your favorites" }
    ],
    genreExploration: [
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", genre: "Funk", reason: "Try some funk music for variety" },
      { title: "Get Lucky", artist: "Daft Punk ft. Pharrell Williams", genre: "Disco", reason: "Disco revival that complements your taste" },
      { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", genre: "Pop", reason: "Feel-good pop music you might enjoy" }
    ]
  };
}

// Save recommendations to database
async function saveRecommendations(userId, recommendations) {
  try {
    // Clear existing recommendations
    await pool.query('DELETE FROM user_recommendations WHERE user_id = $1', [userId]);

    // Insert new recommendations with timestamp
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
          
          // Try to get album cover from Spotify
          let albumArtUrl = song.album_art_url;
          if (!albumArtUrl) {
            albumArtUrl = await searchSpotifyAlbumCover(song.title, song.artist);
          }
          
          // Fallback to placeholder if no album art found
          if (!albumArtUrl) {
            albumArtUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OjTwvdGV4dD4KPC9zdmc+';
          }
          
          const newSong = await pool.query(
            'INSERT INTO songs (spotify_id, title, artist, genre, album_art_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [generatedSpotifyId, song.title, song.artist, song.genre, albumArtUrl]
          );
          songId = newSong.rows[0].id;
        }

        // Save recommendation with timestamp
        await pool.query(
          'INSERT INTO user_recommendations (user_id, song_id, category, reason, last_generated) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
          [userId, songId, category, song.reason]
        );
      }
    }
  } catch (error) {
    console.error('Save recommendations error:', error);
  }
}

// Manually generate and save recommendations for a user
router.post('/user/:userId/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has existing recommendations and if they're less than 24 hours old
    const existingRecs = await pool.query(`
      SELECT last_generated FROM user_recommendations 
      WHERE user_id = $1 
      ORDER BY last_generated DESC 
      LIMIT 1
    `, [userId]);

    if (existingRecs.rows.length > 0) {
      const lastGenerated = new Date(existingRecs.rows[0].last_generated);
      const now = new Date();
      const hoursDiff = (now - lastGenerated) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return res.json({ 
          message: 'Recommendations are still fresh (less than 24 hours old)',
          shouldGenerate: false,
          hoursRemaining: Math.ceil(24 - hoursDiff)
        });
      }
    }
    
    // Get user's favorite songs
    const favoriteSongs = await pool.query(`
      SELECT s.title, s.artist, s.genre
      FROM user_songs us
      JOIN songs s ON us.song_id = s.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
      LIMIT 10
    `, [userId]);

    if (favoriteSongs.rows.length === 0) {
      return res.status(404).json({ error: 'No favorite songs found' });
    }

    // Generate new recommendations
    const recommendations = await generateRecommendations(favoriteSongs.rows);
    
    // Save recommendations to database
    await saveRecommendations(userId, recommendations);

    res.json({ 
      message: 'Recommendations generated successfully',
      recommendations,
      shouldGenerate: true
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get user's saved recommendations
router.get('/user/:userId/saved', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const recommendations = await pool.query(`
      SELECT 
        ur.category,
        ur.reason,
        s.title,
        s.artist,
        s.genre,
        s.album_art_url
      FROM user_recommendations ur
      JOIN songs s ON ur.song_id = s.id
      WHERE ur.user_id = $1
      ORDER BY ur.category, ur.created_at
    `, [userId]);

    // Group by category
    const groupedRecommendations = {};
    recommendations.rows.forEach(rec => {
      if (!groupedRecommendations[rec.category]) {
        groupedRecommendations[rec.category] = [];
      }
      groupedRecommendations[rec.category].push({
        title: rec.title,
        artist: rec.artist,
        genre: rec.genre,
        album_art_url: rec.album_art_url,
        reason: rec.reason
      });
    });

    res.json({ recommendations: groupedRecommendations });
  } catch (error) {
    console.error('Get saved recommendations error:', error);
    res.status(500).json({ error: 'Failed to get saved recommendations' });
  }
});



module.exports = { router, generateRecommendations, saveRecommendations }; 