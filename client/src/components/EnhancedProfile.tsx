import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Heart, Music, Star, Users, UserPlus } from 'lucide-react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  votes_remaining_today: number;
  total_votes_cast: number;
  voting_streak: number;
  created_at: string;
}

interface FavoriteSong {
  id: number;
  title: string;
  artist: string;
  album_art_url: string;
}

interface VotingRecord {
  id: number;
  vote_count: number;
  voted_at: string;
  battle_title: string;
  song_title: string;
  song_artist: string;
  song_art: string;
}

interface Badge {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface Recommendation {
  title: string;
  artist: string;
  genre: string;
  album_art_url: string;
  reason: string;
}

interface Recommendations {
  popularSongs: Recommendation[];
  undergroundGems: Recommendation[];
  sameArtist: Recommendation[];
  genreExploration: Recommendation[];
}

const EnhancedProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [profileData, setProfileData] = useState<{
    user: User;
    favoriteSongs: FavoriteSong[];
    votingHistory: VotingRecord[];
    badges: Badge[];
  } | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [recommendationStatus, setRecommendationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [youtubeThumbnails, setYoutubeThumbnails] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profileData?.user?.id) {
      fetchRecommendations();
    }
  }, [profileData?.user?.id]);

  const fetchRecommendations = async () => {
    try {
      if (profileData?.user?.id) {
        const response = await axios.get(`/recommendations/user/${profileData.user.id}`);
        if (response.data.recommendations) {
          setRecommendations(response.data.recommendations);
          
          // Fetch YouTube thumbnails for recommendations
          await fetchRecommendationThumbnails(response.data.recommendations);
        }
        // Store the response data for status display
        setRecommendationStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchRecommendationThumbnails = async (recs: Recommendations) => {
    try {
      const thumbnails: { [key: string]: string } = {};
      
      // Process all recommendation categories
      const allSongs = [
        ...(recs.popularSongs || []),
        ...(recs.undergroundGems || []),
        ...(recs.sameArtist || []),
        ...(recs.genreExploration || [])
      ];
      
      // Fetch YouTube thumbnails for each song (process all recommendations)
      const songsToProcess = allSongs;
      
      for (const song of songsToProcess) {
        try {
          const response = await axios.get(`/youtube/search?q=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`);
          if (response.data.thumbnail) {
            thumbnails[`${song.title}-${song.artist}`] = response.data.thumbnail;
          }
        } catch (error) {
          console.error(`Failed to fetch YouTube thumbnail for ${song.title}:`, error);
        }
      }
      
      // Merge with existing thumbnails
      setYoutubeThumbnails(prev => ({ ...prev, ...thumbnails }));
    } catch (error) {
      console.error('Failed to fetch recommendation thumbnails:', error);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/profile');
      setProfileData(response.data);
      
      // Fetch YouTube thumbnails for favorite songs
      if (response.data.favoriteSongs) {
        await fetchYouTubeThumbnails(response.data.favoriteSongs);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeThumbnails = async (songs: FavoriteSong[]) => {
    try {
      const thumbnails: { [key: string]: string } = {};
      
      // Fetch YouTube thumbnails for each song (process all favorites)
      const songsToProcess = songs;
      
      for (const song of songsToProcess) {
        try {
          const response = await axios.get(`/youtube/search?q=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`);
          if (response.data.thumbnail) {
            thumbnails[`${song.title}-${song.artist}`] = response.data.thumbnail;
          }
        } catch (error) {
          console.error(`Failed to fetch YouTube thumbnail for ${song.title}:`, error);
        }
      }
      
      setYoutubeThumbnails(thumbnails);
    } catch (error) {
      console.error('Failed to fetch YouTube thumbnails:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-gradient rounded-full mb-4 shadow-2xl animate-spin">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <button onClick={() => navigate('/battles')} className="btn-secondary">
            Back to Battles
          </button>
        </div>
      </div>
    );
  }

  const { user, favoriteSongs, votingHistory, badges } = profileData;

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/battles')}
            className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center text-white hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <h1 className="text-2xl font-bold text-white">JamDuel</h1>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-6">
          {['Profile', 'Badges', 'Voting Record', 'Recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors pb-2 ${
                activeTab === tab 
                  ? 'text-primary-400 border-b-2 border-primary-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Profile' && (
        <div className="px-6 pb-24">
          {/* User Information */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4">
              <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 bg-primary-500/20 rounded-full blur-lg"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
            <p className="text-gray-400">@{user.username.toLowerCase()}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button 
              onClick={() => navigate('/friends')}
              className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-white font-medium hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              <UserPlus className="w-5 h-5 inline mr-3" />
              Friends Circle
            </button>
            <button className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-white font-medium hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 shadow-2xl">
              <Heart className="w-5 h-5 inline mr-3" />
              Saved Songs
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center shadow-2xl">
              <div className="text-2xl font-bold text-primary-400">{user.total_votes_cast}</div>
              <div className="text-xs text-gray-400">Total Votes</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center shadow-2xl">
              <div className="text-2xl font-bold text-primary-400">{user.votes_remaining_today}</div>
              <div className="text-xs text-gray-400">Votes Left</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center shadow-2xl">
              <div className="text-2xl font-bold text-primary-400">{user.voting_streak}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>

          {/* Favorite Songs */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Your Top 10 Songs</h3>
            {favoriteSongs && favoriteSongs.length > 0 ? (
              <div className="space-y-3">
                {favoriteSongs.map((song, index) => (
                  <div key={song.id} className="flex items-center space-x-3 bg-gray-700/50 rounded-xl p-3 hover:bg-gray-600/50 transition-colors">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="relative">
                      <img
                        src={youtubeThumbnails[`${song.title}-${song.artist}`] || song.album_art_url || 'https://via.placeholder.com/48x48/8B5CF6/FFFFFF?text=🎵'}
                        alt={song.title}
                        className="w-12 h-12 rounded-lg object-cover shadow-lg"
                      />
                      <div className="absolute -inset-1 bg-primary-500/20 rounded-lg blur-sm"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white truncate">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No songs saved yet</p>
                <p className="text-sm text-gray-500">Complete onboarding to save your top 10 songs</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Badges' && (
        <div className="px-6 pb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Hey, {user.username}</h2>
            <p className="text-gray-300">Tune in to the people!</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div
                key={badge.name}
                className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center shadow-2xl transition-all duration-200 ${
                  badge.earned 
                    ? 'hover:scale-105 hover:shadow-primary-500/20' 
                    : 'opacity-50'
                }`}
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-semibold text-white mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-400">{badge.description}</p>
                {badge.earned && (
                  <div className="mt-3">
                    <Star className="w-5 h-5 text-yellow-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Voting Record' && (
        <div className="px-6 pb-24">
          <h2 className="text-2xl font-bold text-white mb-6">Your Voting History</h2>
          
          <div className="space-y-4">
            {votingHistory.map((record) => (
              <div key={record.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <img
                    src={record.song_art}
                    alt={record.song_title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{record.song_title}</h3>
                    <p className="text-sm text-gray-400">{record.song_artist}</p>
                    <p className="text-xs text-gray-500">{record.battle_title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-400">{record.vote_count} votes</div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.voted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Recommendations' && (
        <div className="px-6 pb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Discover New Music</h2>
            <p className="text-gray-300">Based on your top 10 songs, here are some recommendations</p>
            
            {/* Generate Recommendations Button */}
            <div className="mt-6">
              {recommendationStatus && !recommendationStatus.shouldGenerate && (
                <div className="mb-4 p-4 bg-blue-900/50 border border-blue-500/50 rounded-xl">
                  <p className="text-blue-200 text-center">
                    {recommendationStatus.message}
                    {recommendationStatus.hoursRemaining && (
                      <span className="block text-sm mt-1">
                        New recommendations available at midnight
                      </span>
                    )}
                  </p>
                </div>
              )}
              <button 
                onClick={async () => {
                  try {
                    const response = await axios.post(`/recommendations/user/${profileData.user.id}/generate`);
                    if (response.data.recommendations) {
                      setRecommendations(response.data.recommendations);
                      setRecommendationStatus(response.data);
                    } else if (response.data.shouldGenerate === false) {
                      setRecommendationStatus(response.data);
                    }
                  } catch (error) {
                    console.error('Failed to generate recommendations:', error);
                  }
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
                disabled={recommendationStatus && !recommendationStatus.shouldGenerate}
              >
                {recommendationStatus && !recommendationStatus.shouldGenerate 
                  ? '⏰ Recommendations Fresh (Until Midnight)' 
                  : '🎵 Generate New Recommendations'
                }
              </button>
            </div>
          </div>

          {!recommendations ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No recommendations yet</p>
              <p className="text-sm text-gray-500 mb-6">Click the button above to generate personalized recommendations based on your top 10 songs</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Popular Songs */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">🔥</span>
                  Popular Songs You Might Like
                </h3>
                <div className="space-y-3">
                  {recommendations?.popularSongs?.map((song, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-xl p-3">
                      <div className="relative">
                        <img
                          src={youtubeThumbnails[`${song.title}-${song.artist}`] || song.album_art_url || 'https://via.placeholder.com/48x48/8B5CF6/FFFFFF?text=🎵'}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="absolute -inset-1 bg-yellow-500/20 rounded-lg blur-sm"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{song.title}</p>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                        <p className="text-xs text-gray-500">{song.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            {/* Underground Gems */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">💎</span>
                Underground Gems
              </h3>
              <div className="space-y-3">
                {recommendations?.undergroundGems?.map((song, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-xl p-3">
                                          <div className="relative">
                        <img
                          src={song.album_art_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj408L3RleHQ+Cjwvc3ZnPg=='}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj408L3RleHQ+Cjwvc3ZnPg==';
                          }}
                        />
                        <div className="absolute -inset-1 bg-purple-500/20 rounded-lg blur-sm"></div>
                      </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                      <p className="text-xs text-gray-500">{song.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Same Artist */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">🎭</span>
                More from Artists You Love
              </h3>
              <div className="space-y-3">
                {recommendations?.sameArtist?.map((song, index) => (
                                      <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-xl p-3">
                      <div className="relative">
                        <img
                          src={song.album_art_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj408L3RleHQ+Cjwvc3ZnPg=='}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IjI0IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj408L3RleHQ+Cjwvc3ZnPg==';
                          }}
                        />
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-lg blur-sm"></div>
                      </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                      <p className="text-xs text-gray-500">{song.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Genre Exploration */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">🌍</span>
                Explore New Genres
              </h3>
              <div className="space-y-3">
                                  {recommendations?.genreExploration?.map((song, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-xl p-3">
                      <div className="relative">
                        <img
                          src={song.album_art_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj408L3RleHQ+Cjwvc3ZnPg=='}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj408L3RleHQ+Cjwvc3ZnPg==';
                          }}
                        />
                        <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur-sm"></div>
                      </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                      <p className="text-xs text-gray-500">{song.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedProfile; 