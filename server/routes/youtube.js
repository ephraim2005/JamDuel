const express = require('express');
const router = express.Router();
const axios = require('axios');

// Search for YouTube videos by song title and artist
router.get('/search', async (req, res) => {
  try {
    const { q, artist } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

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
      res.json({
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle
      });
    } else {
      res.json({ videoId: null, message: 'No videos found' });
    }
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
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
    res.status(500).json({ 
      error: 'Failed to get video details',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router; 