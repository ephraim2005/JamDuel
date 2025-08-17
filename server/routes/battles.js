const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all active battles
router.get('/', async (req, res) => {
  try {
    const battles = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.total_votes,
        b.status,
        b.created_at,
        b.ends_at,
        s1.id as song1_id,
        s1.title as song1_title,
        s1.artist as song1_artist,
        s1.album_art_url as song1_art,
        s1.preview_url as song1_preview,
        s2.id as song2_id,
        s2.title as song2_title,
        s2.artist as song2_artist,
        s2.album_art_url as song2_art,
        s2.preview_url as song2_preview
      FROM battles b
      JOIN songs s1 ON b.song1_id = s1.id
      JOIN songs s2 ON b.song2_id = s2.id
      WHERE b.status = 'active'
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({ battles: battles.rows });
  } catch (error) {
    console.error('Get battles error:', error);
    res.status(500).json({ error: 'Failed to get battles' });
  }
});

// Get battle by ID with detailed info
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const battle = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.total_votes,
        b.song1_votes,
        b.song2_votes,
        b.status,
        b.created_at,
        b.ends_at,
        s1.id as song1_id,
        s1.title as song1_title,
        s1.artist as song1_artist,
        s1.album_art_url as song1_art,
        s1.preview_url as song1_preview,
        s2.id as song2_id,
        s2.title as song2_title,
        s2.artist as song2_artist,
        s2.album_art_url as song2_art,
        s2.preview_url as song2_preview
      FROM battles b
      JOIN songs s1 ON b.song1_id = s1.id
      JOIN songs s2 ON b.song2_id = s2.id
      WHERE b.id = $1
    `, [id]);

    if (battle.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Calculate percentages
    const totalVotes = battle.rows[0].total_votes;
    const song1Percentage = totalVotes > 0 ? Math.round((battle.rows[0].song1_votes / totalVotes) * 100) : 0;
    const song2Percentage = totalVotes > 0 ? Math.round((battle.rows[0].song2_votes / totalVotes) * 100) : 0;

    const battleData = {
      ...battle.rows[0],
      song1_percentage: song1Percentage,
      song2_percentage: song2Percentage
    };

    res.json({ battle: battleData });
  } catch (error) {
    console.error('Get battle error:', error);
    res.status(500).json({ error: 'Failed to get battle' });
  }
});

// Vote on a battle
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { chosenSongId, voteCount } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!chosenSongId || !voteCount || voteCount < 1 || voteCount > 10) {
      return res.status(400).json({ error: 'Invalid vote data' });
    }

    // Check if battle exists and is active
    const battle = await pool.query(
      'SELECT * FROM battles WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (battle.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found or not active' });
    }

    // Check if user already voted on this battle
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND battle_id = $2',
      [userId, id]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'You have already voted on this battle' });
    }

    // Check if user has enough votes remaining
    const user = await pool.query(
      'SELECT votes_remaining_today FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows[0].votes_remaining_today < voteCount) {
      return res.status(400).json({ 
        error: 'Not enough votes remaining',
        votesRemaining: user.rows[0].votes_remaining_today
      });
    }

    // Validate chosen song is part of the battle
    if (chosenSongId != battle.rows[0].song1_id && chosenSongId != battle.rows[0].song2_id) {
      return res.status(400).json({ error: 'Invalid song choice' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert vote
      await client.query(
        'INSERT INTO votes (user_id, battle_id, chosen_song_id, vote_count) VALUES ($1, $2, $3, $4)',
        [userId, id, chosenSongId, voteCount]
      );

      // Update battle vote counts
      if (chosenSongId == battle.rows[0].song1_id) {
        await client.query(
          'UPDATE battles SET song1_votes = song1_votes + $1, total_votes = total_votes + $1 WHERE id = $2',
          [voteCount, id]
        );
      } else {
        await client.query(
          'UPDATE battles SET song2_votes = song2_votes + $1, total_votes = total_votes + $1 WHERE id = $2',
          [voteCount, id]
        );
      }

      // Update user's remaining votes and total votes cast
      await client.query(
        'UPDATE users SET votes_remaining_today = votes_remaining_today - $1, total_votes_cast = total_votes_cast + $1 WHERE id = $2',
        [voteCount, userId]
      );

      await client.query('COMMIT');

      // Get updated battle info
      const updatedBattle = await pool.query(`
        SELECT 
          b.id,
          b.title,
          b.total_votes,
          b.song1_votes,
          b.song2_votes,
          b.status,
          s1.id as song1_id,
          s1.title as song1_title,
          s2.id as song2_id,
          s2.title as song2_title
        FROM battles b
        JOIN songs s1 ON b.song1_id = s1.id
        JOIN songs s2 ON b.song2_id = s2.id
        WHERE b.id = $1
      `, [id]);

      const battleData = updatedBattle.rows[0];
      const totalVotes = battleData.total_votes;
      const song1Percentage = Math.round((battleData.song1_votes / totalVotes) * 100);
      const song2Percentage = Math.round((battleData.song2_votes / totalVotes) * 100);

      // Get updated user info
      const updatedUser = await pool.query(
        'SELECT votes_remaining_today, total_votes_cast FROM users WHERE id = $1',
        [userId]
      );

      res.json({
        message: 'Vote cast successfully',
        battle: {
          ...battleData,
          song1_percentage: song1Percentage,
          song2_percentage: song2Percentage
        },
        user: updatedUser.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// Get user's voting history
router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const votes = await pool.query(`
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

    res.json({ votes: votes.rows });
  } catch (error) {
    console.error('Get voting history error:', error);
    res.status(500).json({ error: 'Failed to get voting history' });
  }
});

module.exports = router; 