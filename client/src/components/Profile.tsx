import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Trophy, Music, TrendingUp, Calendar, Edit } from 'lucide-react';
import axios from 'axios';

interface Vote {
  id: number;
  vote_count: number;
  voted_at: string;
  battle_title: string;
  song_title: string;
  song_artist: string;
  song_art: string;
}

interface UserSong {
  id: number;
  title: string;
  artist: string;
  album_art_url: string;
  saved_at: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userSongs, setUserSongs] = useState<UserSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [votesResponse, songsResponse] = await Promise.all([
        axios.get('/battles/user/history'),
        axios.get('/spotify/user-songs')
      ]);
      
      setVotes(votesResponse.data.votes);
      setUserSongs(songsResponse.data.songs);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUsernameEdit = () => {
    setEditingUsername(true);
    setNewUsername(user?.username || '');
  };

  const saveUsername = async () => {
    try {
      const response = await axios.put('/users/profile', {
        username: newUsername
      });
      
      // Update local user state
      if (user) {
        user.username = newUsername;
      }
      
      setEditingUsername(false);
    } catch (error) {
      console.error('Failed to update username:', error);
    }
  };

  const cancelUsernameEdit = () => {
    setEditingUsername(false);
    setNewUsername(user?.username || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-gradient rounded-full mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
        
        {/* Username Section */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {editingUsername ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="input-field text-center w-32"
                maxLength={20}
              />
              <button
                onClick={saveUsername}
                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors"
              >
                ✓
              </button>
              <button
                onClick={cancelUsernameEdit}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl text-white">{user?.username}</h2>
              <button
                onClick={handleUsernameEdit}
                className="p-1 hover:bg-background-secondary rounded transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
        </div>
        
        <p className="text-gray-400">{user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-400">{user?.votes_remaining_today || 0}</div>
          <div className="text-sm text-gray-400">Votes Remaining</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-400">{user?.total_votes_cast || 0}</div>
          <div className="text-sm text-gray-400">Total Votes Cast</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-400">{user?.voting_streak || 0}</div>
          <div className="text-sm text-gray-400">Voting Streak</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-400">{userSongs.length}</div>
          <div className="text-sm text-gray-400">Favorite Songs</div>
        </div>
      </div>

      {/* Recent Votes */}
      {votes.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Votes</h3>
          <div className="space-y-3">
            {votes.slice(0, 5).map((vote) => (
              <div key={vote.id} className="flex items-center space-x-3 p-3 bg-background-tertiary rounded-lg">
                <img
                  src={vote.song_art || 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=🎵'}
                  alt={vote.song_title}
                  className="w-10 h-10 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{vote.song_title}</p>
                  <p className="text-gray-400 text-xs truncate">{vote.song_artist}</p>
                </div>
                <div className="text-right">
                  <div className="text-primary-400 font-semibold">{vote.vote_count} votes</div>
                  <div className="text-xs text-gray-500">
                    {new Date(vote.voted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Songs */}
      {userSongs.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Your Favorite Songs</h3>
          <div className="grid grid-cols-2 gap-3">
            {userSongs.slice(0, 6).map((song) => (
              <div key={song.id} className="flex items-center space-x-3 p-3 bg-background-tertiary rounded-lg">
                <img
                  src={song.album_art_url || 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=🎵'}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{song.title}</p>
                  <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="btn-secondary w-full py-4 flex items-center justify-center space-x-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Profile; 