const express = require('express');
const spotifyAPI = require('../config/spotify');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Search for songs using Spotify API
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const tracks = await spotifyAPI.searchTracks(q.trim(), parseInt(limit));
    res.json({ tracks });
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
});

// Get track details from Spotify
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const track = await spotifyAPI.getTrackDetails(id);
    res.json({ track });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: 'Failed to get track details' });
  }
});

// Save song to database (for onboarding)
router.post('/save-song', authenticateToken, async (req, res) => {
  try {
    const { spotifyId, title, artist, album, previewUrl, albumArtUrl } = req.body;
    const userId = req.user.userId;

    if (!spotifyId || !title || !artist) {
      return res.status(400).json({ error: 'Missing required song information' });
    }

    // Check if song already exists in database
    let song = await pool.query(
      'SELECT * FROM songs WHERE spotify_id = $1',
      [spotifyId]
    );

    if (song.rows.length === 0) {
      // Create new song
      song = await pool.query(
        'INSERT INTO songs (spotify_id, title, artist, album, preview_url, album_art_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [spotifyId, title, artist, album, previewUrl, albumArtUrl]
      );
    }

    // Check if user already has this song
    const existingUserSong = await pool.query(
      'SELECT * FROM user_songs WHERE user_id = $1 AND song_id = $2',
      [userId, song.rows[0].id]
    );

    if (existingUserSong.rows.length > 0) {
      return res.status(400).json({ error: 'Song already in your favorites' });
    }

    // Add song to user's favorites
    await pool.query(
      'INSERT INTO user_songs (user_id, song_id) VALUES ($1, $2)',
      [userId, song.rows[0].id]
    );

    res.json({
      message: 'Song saved successfully',
      song: song.rows[0]
    });
  } catch (error) {
    console.error('Save song error:', error);
    res.status(500).json({ error: 'Failed to save song' });
  }
});

// Get user's saved songs
router.get('/user-songs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const songs = await pool.query(`
      SELECT 
        s.id,
        s.spotify_id,
        s.title,
        s.artist,
        s.album,
        s.preview_url,
        s.album_art_url,
        us.created_at as saved_at
      FROM user_songs us
      JOIN songs s ON us.song_id = s.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
    `, [userId]);

    res.json({ songs: songs.rows });
  } catch (error) {
    console.error('Get user songs error:', error);
    res.status(500).json({ error: 'Failed to get user songs' });
  }
});

// Remove song from user's favorites
router.delete('/user-songs/:songId', authenticateToken, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM user_songs WHERE user_id = $1 AND song_id = $2',
      [userId, songId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Song not found in favorites' });
    }

    res.json({ message: 'Song removed from favorites' });
  } catch (error) {
    console.error('Remove song error:', error);
    res.status(500).json({ error: 'Failed to remove song' });
  }
});

module.exports = router; 