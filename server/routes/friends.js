const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Search for users by username or email
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchQuery = `
      SELECT 
        u.id, 
        u.username, 
        u.email,
        CASE 
          WHEN uf.friend_id IS NOT NULL THEN 'friend'
          WHEN uf.friend_id IS NULL AND u.id != $1 THEN 'not_friend'
          ELSE 'self'
        END as relationship
      FROM users u
      LEFT JOIN user_friends uf ON uf.user_id = $1 AND uf.friend_id = u.id
      WHERE (u.username ILIKE $2 OR u.email ILIKE $2)
        AND u.id != $1
      ORDER BY u.username
      LIMIT 20
    `;

    const result = await pool.query(searchQuery, [currentUserId, `%${q.trim()}%`]);
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user's friends list
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email,
        uf.created_at as friends_since
      FROM user_friends uf
      JOIN users u ON uf.user_id = $1 AND uf.friend_id = u.id
      ORDER BY u.username
    `;

    const result = await pool.query(query, [userId]);
    
    res.json({ friends: result.rows });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends list' });
  }
});

// Add a friend
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ error: 'Friend ID is required' });
    }

    if (userId === friendId) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    // Check if already friends
    const existingFriend = await pool.query(
      'SELECT * FROM user_friends WHERE user_id = $1 AND friend_id = $2',
      [userId, friendId]
    );

    if (existingFriend.rows.length > 0) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }

    // Add friend
    await pool.query(
      'INSERT INTO user_friends (user_id, friend_id) VALUES ($1, $2)',
      [userId, friendId]
    );

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Remove a friend
router.delete('/remove/:friendId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    // Remove friendship
    await pool.query(
      'DELETE FROM user_friends WHERE user_id = $1 AND friend_id = $2',
      [userId, friendId]
    );

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Get another user's profile (public info only)
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    // Check if they are friends
    const friendshipQuery = `
      SELECT COUNT(*) as is_friend 
      FROM user_friends 
      WHERE user_id = $1 AND friend_id = $2
    `;
    
    const friendshipResult = await pool.query(friendshipQuery, [currentUserId, targetUserId]);
    const isFriend = friendshipResult.rows[0].is_friend > 0;

    // Get user info
    const userQuery = 'SELECT id, username, email FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [targetUserId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get their top 10 songs
    const songsQuery = `
      SELECT s.title, s.artist, s.genre, s.album_art_url
      FROM user_songs us
      JOIN songs s ON us.song_id = s.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
      LIMIT 10
    `;
    
    const songsResult = await pool.query(songsQuery, [targetUserId]);

    // Get their recommendations (only if friends)
    let recommendations = null;
    if (isFriend) {
      const recQuery = `
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
      `;
      
      const recResult = await pool.query(recQuery, [targetUserId]);
      
      // Group by category
      const groupedRecommendations = {};
      recResult.rows.forEach(rec => {
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
      
      recommendations = groupedRecommendations;
    }

    res.json({
      user,
      songs: songsResult.rows,
      recommendations,
      isFriend,
      message: isFriend ? 'Full profile access granted' : 'Limited profile access (add as friend to see recommendations)'
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

module.exports = { router }; 