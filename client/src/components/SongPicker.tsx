import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Music } from 'lucide-react';
import axios from 'axios';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  preview_url: string;
  album_art_url: string;
}

const SongPicker: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const searchSongs = async (query: string) => {
    if (query.trim().length < 2) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/spotify/search?q=${encodeURIComponent(query)}&limit=20`);
      setSearchResults(response.data.tracks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchSongs(searchQuery);
  };

  const addSong = async (song: Song) => {
    if (selectedSongs.length >= 5) return;
    if (selectedSongs.find(s => s.id === song.id)) return;

    try {
      await axios.post('/spotify/save-song', {
        spotifyId: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        previewUrl: song.preview_url,
        albumArtUrl: song.album_art_url
      });

      setSelectedSongs([...selectedSongs, song]);
    } catch (error) {
      console.error('Failed to save song:', error);
    }
  };

  const removeSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== songId));
  };



  const startBattling = () => {
    if (selectedSongs.length >= 3) {
      navigate('/app/battles');
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pick Your Favorites</h1>
        <p className="text-gray-400">
          Choose 3-5 of your favorite songs to get started
        </p>
        <div className="mt-4">
          <span className="text-primary-400 font-semibold">
            {selectedSongs.length}/5 selected
          </span>
        </div>
      </div>

      {/* Selected Songs */}
      {selectedSongs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Songs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedSongs.map((song) => (
              <div key={song.id} className="card flex items-center space-x-3">
                <img
                  src={song.album_art_url || 'https://via.placeholder.com/60x60/8B5CF6/FFFFFF?text=🎵'}
                  alt={song.title}
                  className="w-15 h-15 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{song.title}</p>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
                <button
                  onClick={() => removeSong(song.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs, artists, or albums..."
              className="input-field w-full pl-10 pr-4"
            />
          </div>
          <button
            type="submit"
            disabled={loading || searchQuery.trim().length < 2}
            className="btn-primary mt-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Search Results</h2>
          <div className="space-y-3">
            {searchResults.map((song) => {
              const isSelected = selectedSongs.find(s => s.id === song.id);
              const isPlaying = currentlyPlaying === song.id;
              
              return (
                <div key={song.id} className="card">
                  <div className="flex items-center space-x-4 mb-3">
                    <img
                      src={song.album_art_url || 'https://via.placeholder.com/60x60/8B5CF6/FFFFFF?text=🎵'}
                      alt={song.title}
                      className="w-15 h-15 rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{song.title}</p>
                      <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      <p className="text-gray-500 text-xs truncate">{song.album}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isSelected && selectedSongs.length < 5 && (
                        <button
                          onClick={() => addSong(song)}
                          className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* YouTube Video Preview */}
                  {song.preview_url && (
                    <div className="mt-3">
                      <YouTubeVideoPlayer
                        songTitle={song.title}
                        artist={song.artist}
                        videoId={song.preview_url} // This will be YouTube video ID
                        className="w-full h-32"
                        onPlay={() => setCurrentlyPlaying(song.id)}
                        onPause={() => setCurrentlyPlaying(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Battling Button */}
      {selectedSongs.length >= 3 && (
        <div className="fixed bottom-6 left-6 right-6">
          <button
            onClick={startBattling}
            className="btn-primary w-full py-4 text-lg"
          >
            Start Battling! 🎵
          </button>
        </div>
      )}
    </div>
  );
};

export default SongPicker; 