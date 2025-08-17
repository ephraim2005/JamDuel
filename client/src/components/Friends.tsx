import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, UserMinus, Users, Music, Heart, Star } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  relationship: 'friend' | 'not_friend' | 'self';
}

interface Friend {
  id: number;
  username: string;
  email: string;
  friends_since: string;
}

interface UserProfile {
  user: {
    id: number;
    username: string;
    email: string;
  };
  songs: Array<{
    title: string;
    artist: string;
    genre: string;
    album_art_url: string;
  }>;
  recommendations: any;
  isFriend: boolean;
  message: string;
}

const Friends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'friends' | 'profile'>('search');

  // Search for users
  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`/friends/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get friends list
  const fetchFriends = async () => {
    try {
      const response = await axios.get('/friends/list');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  // Add friend
  const addFriend = async (friendId: number) => {
    try {
      await axios.post('/friends/add', { friendId });
      // Refresh search results and friends list
      if (searchQuery.trim()) {
        searchUsers();
      }
      fetchFriends();
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  // Remove friend
  const removeFriend = async (friendId: number) => {
    try {
      await axios.delete(`/friends/remove/${friendId}`);
      // Refresh friends list
      fetchFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  // View user profile
  const viewProfile = async (userId: number) => {
    try {
      const response = await axios.get(`/friends/profile/${userId}`);
      setSelectedUser(response.data);
      setActiveTab('profile');
    } catch (error) {
      console.error('Failed to view profile:', error);
    }
  };

  // Load friends on component mount
  useEffect(() => {
    fetchFriends();
  }, []);

  // Search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Friends Circle</h1>
          <p className="text-gray-300">Connect with music lovers and discover new tastes</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'search'
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search Users
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'friends'
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            My Friends ({friends.length})
          </button>
          {selectedUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              {selectedUser.user.username}
            </button>
          )}
        </div>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={searchUsers}
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-1 rounded-lg transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
                {searchResults.map((user) => (
                  <div key={user.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{user.username}</h4>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.relationship === 'friend' ? (
                          <span className="text-green-400 text-sm font-medium">✓ Friends</span>
                        ) : user.relationship === 'not_friend' ? (
                          <button
                            onClick={() => addFriend(user.id)}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Friend</span>
                          </button>
                        ) : null}
                        <button
                          onClick={() => viewProfile(user.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <UserPlus className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6">My Friends Circle</h3>
            
            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{friend.username}</h4>
                          <p className="text-sm text-gray-400">{friend.email}</p>
                          <p className="text-xs text-gray-500">
                            Friends since {new Date(friend.friends_since).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewProfile(friend.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No friends yet</p>
                <p className="text-sm text-gray-500">Search for users and add them to your circle</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Profile Tab */}
      {activeTab === 'profile' && selectedUser && (
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {selectedUser.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.user.username}</h2>
                  <p className="text-gray-400">{selectedUser.user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {selectedUser.isFriend ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Friends
                      </span>
                    ) : (
                      <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-medium">
                        Not Friends
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Top 10 Songs */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Music className="w-5 h-5 mr-2" />
                Top 10 Songs
              </h3>
              
              {selectedUser.songs.length > 0 ? (
                <div className="space-y-3">
                  {selectedUser.songs.map((song, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-700/30 rounded-lg p-3">
                      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        🎵
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white truncate">{song.title}</p>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                        {song.genre}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No songs saved yet</p>
              )}
            </div>

            {/* Recommendations (only visible to friends) */}
            {selectedUser.isFriend && selectedUser.recommendations ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Music Recommendations
                </h3>
                
                {Object.entries(selectedUser.recommendations).map(([category, songs]: [string, any]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-lg font-medium text-primary-400 mb-3 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="space-y-3">
                      {songs.map((song: any, index: number) => (
                        <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              🎵
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">{song.title}</p>
                              <p className="text-sm text-gray-400">{song.artist}</p>
                              <p className="text-xs text-gray-500 mt-1">{song.reason}</p>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                              {song.genre}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !selectedUser.isFriend ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-lg text-center">
                <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Add as Friend to See More</h3>
                <p className="text-gray-400 mb-4">
                  {selectedUser.message}
                </p>
                <button
                  onClick={() => addFriend(selectedUser.user.id)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Add Friend
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends; 