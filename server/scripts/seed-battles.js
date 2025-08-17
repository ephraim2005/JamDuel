const pool = require('../config/database');

const seedBattles = async () => {
  try {
    console.log('🌱 Seeding JamDuel database with initial battles...');

    // First, create some sample songs
    const songs = [
      {
        spotify_id: 'spotify:track:3z8h0TU7ReDPLIbEnYhWZb',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        preview_url: 'https://p.scdn.co/mp3-preview/3z8h0TU7ReDPLIbEnYhWZb',
        album_art_url: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Queen'
      },
      {
        spotify_id: 'spotify:track:5CQ30WqJwcep0pYcV4AMNc',
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        preview_url: 'https://p.scdn.co/mp3-preview/5CQ30WqJwcep0pYcV4AMNc',
        album_art_url: 'https://via.placeholder.com/300x300/4C1D95/FFFFFF?text=LZ'
      },
      {
        spotify_id: 'spotify:track:2LBqCSwhJGcFQeTHMVGwy3',
        title: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        preview_url: 'https://p.scdn.co/mp3-preview/2LBqCSwhJGcFQeTHMVGwy3',
        album_art_url: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=Eagles'
      },
      {
        spotify_id: 'spotify:track:3BQHpFgAp4l80e1XslIjNI',
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        album: 'Appetite for Destruction',
        preview_url: 'https://p.scdn.co/mp3-preview/3BQHpFgAp4l80e1XslIjNI',
        album_art_url: 'https://via.placeholder.com/300x300/6D28D9/FFFFFF?text=GNR'
      },
      {
        spotify_id: 'spotify:track:7dMJa1xxXuCjrHqk2gDgM3',
        title: 'Imagine',
        artist: 'John Lennon',
        album: 'Imagine',
        preview_url: 'https://p.scdn.co/mp3-preview/7dMJa1xxXuCjrHqk2gDgM3',
        album_art_url: 'https://via.placeholder.com/300x300/5B21B6/FFFFFF?text=JL'
      },
      {
        spotify_id: 'spotify:track:3JZtXNtR59Q3l3yKek1unF',
        title: 'What\'s Going On',
        artist: 'Marvin Gaye',
        album: 'What\'s Going On',
        preview_url: 'https://p.scdn.co/mp3-preview/3JZtXNtR59Q3l3yKek1unF',
        album_art_url: 'https://via.placeholder.com/300x300/4C1D95/FFFFFF?text=MG'
      },
      {
        spotify_id: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh',
        title: 'Purple Haze',
        artist: 'Jimi Hendrix',
        album: 'Are You Experienced',
        preview_url: 'https://p.scdn.co/mp3-preview/4iV5W9uYEdYUVa79Axb7Rh',
        album_art_url: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=JH'
      },
      {
        spotify_id: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
        title: 'Superstition',
        artist: 'Stevie Wonder',
        album: 'Talking Book',
        preview_url: 'https://p.scdn.co/mp3-preview/6rqhFgbbKwnb9MLmUQDhG6',
        album_art_url: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=SW'
      }
    ];

    // Insert songs
    const songIds = [];
    for (const song of songs) {
      const result = await pool.query(
        'INSERT INTO songs (spotify_id, title, artist, album, preview_url, album_art_url) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (spotify_id) DO UPDATE SET title = EXCLUDED.title RETURNING id',
        [song.spotify_id, song.title, song.artist, song.album, song.preview_url, song.album_art_url]
      );
      songIds.push(result.rows[0].id);
    }
    console.log('✅ Songs created/updated');

    // Create battles
    const battles = [
      {
        title: 'Classic Rock Showdown',
        song1_id: songIds[0], // Bohemian Rhapsody
        song2_id: songIds[1]  // Stairway to Heaven
      },
      {
        title: '70s Rock Battle',
        song1_id: songIds[2], // Hotel California
        song2_id: songIds[3]  // Sweet Child O' Mine
      },
      {
        title: 'Soulful Classics',
        song1_id: songIds[4], // Imagine
        song2_id: songIds[5]  // What's Going On
      },
      {
        title: 'Guitar Legends',
        song1_id: songIds[6], // Purple Haze
        song2_id: songIds[7]  // Superstition
      },
      {
        title: 'Epic Ballads',
        song1_id: songIds[1], // Stairway to Heaven
        song2_id: songIds[4]  // Imagine
      }
    ];

    for (const battle of battles) {
      await pool.query(
        'INSERT INTO battles (title, song1_id, song2_id, created_at, ends_at) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL \'24 hours\') ON CONFLICT DO NOTHING',
        [battle.title, battle.song1_id, battle.song2_id]
      );
    }
    console.log('✅ Battles created');

    console.log('🎉 Database seeding complete!');
    console.log(`📊 Created ${songIds.length} songs and ${battles.length} battles`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedBattles(); 