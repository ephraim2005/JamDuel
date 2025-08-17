const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'jamduel',
  port: process.env.DB_PORT || 5432,
});

// Helper function to check cache
async function checkCache(songTitle, artist) {
  try {
    const query = `
      SELECT video_id, thumbnail_url, title, channel_title, created_at 
      FROM youtube_cache 
      WHERE song_title = $1 AND artist = $2 
      AND created_at > NOW() - INTERVAL '24 hours'
    `;
    
    const result = await pool.query(query, [songTitle, artist]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Cache check error:', error);
    return null;
  }
}

// Helper function to store in cache
async function storeInCache(songTitle, artist, videoData) {
  try {
    const query = `
      INSERT INTO youtube_cache (song_title, artist, video_id, thumbnail_url, title, channel_title)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (song_title, artist) 
      DO UPDATE SET 
        video_id = EXCLUDED.video_id,
        thumbnail_url = EXCLUDED.thumbnail_url,
        title = EXCLUDED.title,
        channel_title = EXCLUDED.channel_title,
        created_at = NOW()
    `;
    
    await pool.query(query, [
      songTitle, 
      artist, 
      videoData.videoId, 
      videoData.thumbnail, 
      videoData.title, 
      videoData.channelTitle
    ]);
  } catch (error) {
    console.error('Cache store error:', error);
  }
}

// Search for YouTube videos by song title and artist
router.get('/search', async (req, res) => {
  try {
    const { q, artist } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Check cache first
    const cachedResult = await checkCache(q, artist);
    if (cachedResult) {
      console.log(`🎯 Cache HIT for "${q}" by "${artist}"`);
      return res.json({
        videoId: cachedResult.video_id,
        title: cachedResult.title,
        thumbnail: cachedResult.thumbnail_url,
        channelTitle: cachedResult.channel_title,
        fromCache: true
      });
    }

    console.log(`🔄 Cache MISS for "${q}" by "${artist}" - calling YouTube API`);
    
    const searchQuery = artist ? `${q} ${artist} official music video` : `${q} official music video`;
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      const videoData = {
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle
      };
      
      // Store in cache for future requests
      await storeInCache(q, artist, videoData);
      
      res.json({
        ...videoData,
        fromCache: false
      });
    } else {
      res.json({ videoId: null, message: 'No videos found' });
    }
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    
    // Handle quota exceeded specifically
    if (error.response?.status === 403 && error.response?.data?.error?.message?.includes('quota')) {
      return res.status(429).json({ 
        error: 'YouTube API quota exceeded',
        message: 'Daily limit reached. Please try again tomorrow or use a new API key.',
        quotaExceeded: true
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: 'Failed to search YouTube',
      details: error.response?.data || error.message
    });
  }
});

// Get video details by video ID
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      res.json({
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount
      });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    console.error('YouTube video details error:', error.response?.data || error.message);
    
    // Handle quota exceeded specifically
    if (error.response?.status === 403 && error.response?.data?.error?.message?.includes('quota')) {
      return res.status(429).json({ 
        error: 'YouTube API quota exceeded',
        message: 'Daily limit reached. Please try again tomorrow or use a new API key.',
        quotaExceeded: true
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: 'Failed to get video details',
      details: error.response?.data || error.message
    });
  }
});

// Add a cleanup route to remove old cache entries
router.post('/cleanup', async (req, res) => {
  try {
    const query = `
      DELETE FROM youtube_cache 
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `;
    
    const result = await pool.query(query);
    console.log(`🧹 Cleaned up ${result.rowCount} old cache entries`);
    
    res.json({ 
      message: 'Cache cleanup completed', 
      removedEntries: result.rowCount 
    });
  } catch (error) {
    console.error('Cache cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup cache' });
  }
});

module.exports = router; 