const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('🗄️ Setting up JamDuel database...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100),
        votes_remaining_today INTEGER DEFAULT 10,
        last_vote_reset DATE DEFAULT CURRENT_DATE,
        total_votes_cast INTEGER DEFAULT 0,
        voting_streak INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Create songs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        spotify_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        album VARCHAR(255),
        preview_url VARCHAR(500),
        album_art_url VARCHAR(500),
        genres TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Songs table created');

    // Create battles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS battles (
        id SERIAL PRIMARY KEY,
        song1_id INTEGER REFERENCES songs(id),
        song2_id INTEGER REFERENCES songs(id),
        title VARCHAR(255),
        total_votes INTEGER DEFAULT 0,
        song1_votes INTEGER DEFAULT 0,
        song2_votes INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        ends_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
      );
    `);
    console.log('✅ Battles table created');

    // Create votes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        battle_id INTEGER REFERENCES battles(id),
        chosen_song_id INTEGER REFERENCES songs(id),
        vote_count INTEGER NOT NULL CHECK (vote_count >= 1 AND vote_count <= 10),
        voted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, battle_id)
      );
    `);
    console.log('✅ Votes table created');

    // Create user_songs table for onboarding preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_songs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        song_id INTEGER REFERENCES songs(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, song_id)
      );
    `);
    console.log('✅ User songs table created');

    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

createTables(); 