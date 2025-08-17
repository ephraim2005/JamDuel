const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all songs (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const songs = await pool.query(
      'SELECT * FROM songs ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ songs: songs.rows });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Failed to get songs' });
  }
});

// Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const song = await pool.query(
      'SELECT * FROM songs WHERE id = $1',
      [id]
    );

    if (song.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ song: song.rows[0] });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Failed to get song' });
  }
});

// Get popular songs (most used in battles)
router.get('/popular/top', async (req, res) => {
  try {
    const songs = await pool.query(`
      SELECT 
        s.*,
        COUNT(b.id) as battle_count
      FROM songs s
      LEFT JOIN battles b ON s.id = b.song1_id OR s.id = b.song2_id
      GROUP BY s.id
      ORDER BY battle_count DESC
      LIMIT 20
    `);

    res.json({ songs: songs.rows });
  } catch (error) {
    console.error('Get popular songs error:', error);
    res.status(500).json({ error: 'Failed to get popular songs' });
  }
});

// Get songs by genre (if available)
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const songs = await pool.query(
      'SELECT * FROM songs WHERE $1 = ANY(genres) ORDER BY created_at DESC LIMIT 50',
      [genre]
    );

    res.json({ songs: songs.rows });
  } catch (error) {
    console.error('Get songs by genre error:', error);
    res.status(500).json({ error: 'Failed to get songs by genre' });
  }
});

module.exports = router; 