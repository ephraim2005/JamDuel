const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, votes_remaining_today, total_votes_cast, voting_streak',
      [email, passwordHash, username || email.split('@')[0]]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await pool.query(
      'SELECT id, email, password_hash, username, votes_remaining_today, total_votes_cast, voting_streak FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset votes if it's a new day
    const today = new Date().toDateString();
    const lastVoteReset = user.rows[0].last_vote_reset ? new Date(user.rows[0].last_vote_reset).toDateString() : null;
    
    let votesRemaining = user.rows[0].votes_remaining_today;
    if (lastVoteReset !== today) {
      await pool.query(
        'UPDATE users SET votes_remaining_today = 10, last_vote_reset = CURRENT_DATE WHERE id = $1',
        [user.rows[0].id]
      );
      votesRemaining = 10;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        ...user.rows[0],
        votes_remaining_today: votesRemaining
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Verify token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, username, votes_remaining_today, total_votes_cast, voting_streak, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = { router, authenticateToken }; 