const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user profile with stats
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user info
    const user = await pool.query(
      'SELECT id, username, email, votes_remaining_today, total_votes_cast, voting_streak, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's favorite songs
    const favoriteSongs = await pool.query(`
      SELECT s.id, s.title, s.artist, s.album_art_url
      FROM user_songs us
      JOIN songs s ON us.song_id = s.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
      LIMIT 10
    `, [userId]);

    // Get user's voting history
    const votingHistory = await pool.query(`
      SELECT 
        v.id,
        v.vote_count,
        v.voted_at,
        b.id as battle_id,
        b.title as battle_title,
        s.title as song_title,
        s.artist as song_artist,
        s.album_art_url as song_art
      FROM votes v
      JOIN battles b ON v.battle_id = b.id
      JOIN songs s ON v.chosen_song_id = s.id
      WHERE v.user_id = $1
      ORDER BY v.voted_at DESC
      LIMIT 20
    `, [userId]);

    // Get user's badges (based on achievements)
    const badges = [];
    
    // First Steps badge - for first vote
    if (user.rows[0].total_votes_cast > 0) {
      badges.push({
        name: 'First Steps',
        description: 'Cast your first vote',
        icon: '🥉',
        earned: true
      });
    }

    // Underground Icon badge - for 10+ votes
    if (user.rows[0].total_votes_cast >= 10) {
      badges.push({
        name: 'Underground Icon',
        description: 'Cast 10+ votes',
        icon: '⭐',
        earned: true
      });
    }

    // Audiophile badge - for 50+ votes
    if (user.rows[0].total_votes_cast >= 50) {
      badges.push({
        name: 'Audiophile',
        description: 'Cast 50+ votes',
        icon: '🏅',
        earned: true
      });
    }

    // Finger on the Pulse badge - for 100+ votes
    if (user.rows[0].total_votes_cast >= 100) {
      badges.push({
        name: 'Finger on the Pulse',
        description: 'Cast 100+ votes',
        icon: '🏆',
        earned: true
      });
    }

    // Add unearned badges
    if (user.rows[0].total_votes_cast < 10) {
      badges.push({
        name: 'Underground Icon',
        description: 'Cast 10+ votes',
        icon: '⭐',
        earned: false
      });
    }
    if (user.rows[0].total_votes_cast < 50) {
      badges.push({
        name: 'Audiophile',
        description: 'Cast 50+ votes',
        icon: '🏅',
        earned: false
      });
    }
    if (user.rows[0].total_votes_cast < 100) {
      badges.push({
        name: 'Finger on the Pulse',
        description: 'Cast 100+ votes',
        icon: '🏆',
        earned: false
      });
    }

    res.json({
      user: user.rows[0],
      favoriteSongs: favoriteSongs.rows,
      votingHistory: votingHistory.rows,
      badges: badges
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Save user's favorite songs during onboarding
router.post('/favorite-songs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { songs } = req.body; // Array of { title, artist }

    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ error: 'Songs array is required' });
    }

    // Clear existing favorite songs
    await pool.query('DELETE FROM user_songs WHERE user_id = $1', [userId]);

    // Insert new favorite songs
    for (const song of songs) {
      // First, try to find the song in the songs table
      let songResult = await pool.query(
        'SELECT id FROM songs WHERE LOWER(title) = LOWER($1) AND LOWER(artist) = LOWER($2)',
        [song.title, song.artist]
      );

      let songId;
      if (songResult.rows.length > 0) {
        // Song exists, use its ID
        songId = songResult.rows[0].id;
      } else {
        // Song doesn't exist, create it with a generated spotify_id
        const generatedSpotifyId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSong = await pool.query(
          'INSERT INTO songs (spotify_id, title, artist, album_art_url, preview_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [generatedSpotifyId, song.title, song.artist, 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=🎵', null]
        );
        songId = newSong.rows[0].id;
      }

      // Add to user_songs
      await pool.query(
        'INSERT INTO user_songs (user_id, song_id) VALUES ($1, $2)',
        [userId, songId]
      );
    }

    res.json({ message: 'Favorite songs saved successfully' });

  } catch (error) {
    console.error('Save favorite songs error:', error);
    res.status(500).json({ error: 'Failed to save favorite songs' });
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT v.battle_id) as battles_participated,
        SUM(v.vote_count) as total_votes_cast,
        COUNT(v.id) as total_voting_sessions,
        u.votes_remaining_today,
        u.voting_streak
      FROM users u
      LEFT JOIN votes v ON u.id = v.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.votes_remaining_today, u.voting_streak
    `, [userId]);

    res.json({ stats: stats.rows[0] || {} });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router; 