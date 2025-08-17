const axios = require('axios');

class SpotifyAPI {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Expire 1 minute early

      console.log('🎵 Spotify access token refreshed');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Spotify access token:', error.message);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        params: {
          q: query,
          type: 'track',
          limit: limit,
          market: 'US'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        preview_url: track.preview_url,
        album_art_url: track.album.images[0]?.url,
        duration_ms: track.duration_ms,
        spotify_url: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('❌ Spotify search failed:', error.message);
      throw new Error('Failed to search Spotify tracks');
    }
  }

  async getTrackDetails(trackId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const track = response.data;
      return {
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        preview_url: track.preview_url,
        album_art_url: track.album.images[0]?.url,
        duration_ms: track.duration_ms,
        spotify_url: track.external_urls.spotify,
        genres: [] // Spotify doesn't provide genres for individual tracks
      };
    } catch (error) {
      console.error('❌ Failed to get track details:', error.message);
      throw new Error('Failed to get track details from Spotify');
    }
  }

  async getArtistGenres(artistId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.genres || [];
    } catch (error) {
      console.error('❌ Failed to get artist genres:', error.message);
      return [];
    }
  }
}

module.exports = new SpotifyAPI(); 