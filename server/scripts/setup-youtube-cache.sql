-- Create YouTube cache table to store video IDs and thumbnails
-- This prevents calling the YouTube API multiple times for the same song within 24 hours
CREATE TABLE IF NOT EXISTS youtube_cache (
    id SERIAL PRIMARY KEY,
    song_title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    video_id VARCHAR(20),
    thumbnail_url TEXT,
    title VARCHAR(500),
    channel_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(song_title, artist)
);
-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_youtube_cache_lookup ON youtube_cache(song_title, artist);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_created ON youtube_cache(created_at);
-- Add comment explaining the table
COMMENT ON TABLE youtube_cache IS 'Cache for YouTube video data to reduce API calls. Data expires after 24 hours.';