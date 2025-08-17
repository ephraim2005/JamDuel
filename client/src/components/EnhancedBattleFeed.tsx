import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Heart, User, Music, Trophy, Home } from 'lucide-react';
import axios from 'axios';

interface Battle {
  id: number;
  title: string;
  song1_title: string;
  song1_artist: string;
  song1_art: string;
  song2_title: string;
  song2_artist: string;
  song2_art: string;
  total_votes: number;
  status: string;
}

const EnhancedBattleFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Most Voted');

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/battles');
      setBattles(response.data.battles);
    } catch (error) {
      console.error('Failed to fetch battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBattleClick = (battleId: number) => {
    navigate(`/battle/${battleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-gradient rounded-full mb-4 shadow-2xl animate-spin">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-white">Loading battles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Enhanced Header */}
      <div className="px-6 pt-12 pb-6">
        {/* User Info Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-white">
              <h1 className="text-2xl font-bold">Hey, {user?.username || 'User'}</h1>
              <p className="text-gray-300 text-sm">
                You have {user?.votes_remaining_today || 10} votes left today
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-1 bg-primary-500/20 rounded-full blur-sm"></div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search song, artist, or genre"
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-4 py-3 pl-12 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-600/50"></div>
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700/50 rounded-lg transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Popular Polls Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Popular Polls</h2>
          <button className="text-primary-400 text-sm hover:text-primary-300 transition-colors">
            View all
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-6">
          {['Most Voted', 'Nearby', 'Latest'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors ${
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

      {/* Horizontal Battle Cards */}
      <div className="px-6 pb-24">
        <div className="space-y-4">
          {battles.map((battle) => (
            <div
              key={battle.id}
              onClick={() => handleBattleClick(battle.id)}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary-500/20 group"
            >
              <div className="flex items-center justify-between">
                {/* Song 1 */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={battle.song1_art}
                      alt={battle.song1_title}
                      className="w-16 h-16 rounded-xl object-cover shadow-lg"
                    />
                    <div className="absolute -inset-1 bg-primary-500/20 rounded-xl blur-sm"></div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white truncate max-w-24">{battle.song1_title}</p>
                    <p className="text-gray-400 text-xs truncate max-w-24">{battle.song1_artist}</p>
                  </div>
                </div>

                {/* VS Section */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400 drop-shadow-lg mb-1">VS</div>
                  <div className="text-xs text-gray-500">{battle.total_votes} votes</div>
                </div>

                {/* Song 2 */}
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-right">
                    <p className="font-medium text-white truncate max-w-24">{battle.song2_title}</p>
                    <p className="text-gray-400 text-xs truncate max-w-24">{battle.song2_artist}</p>
                  </div>
                  <div className="relative">
                    <img
                      src={battle.song2_art}
                      alt={battle.song2_title}
                      className="w-16 h-16 rounded-xl object-cover shadow-lg"
                    />
                    <div className="absolute -inset-1 bg-primary-500/20 rounded-xl blur-sm"></div>
                  </div>
                </div>
              </div>

              {/* Like Button */}
              <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Heart className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-700/50">
        <div className="flex items-center justify-around py-4">
          <button className="flex flex-col items-center space-y-1 text-primary-400">
            <div className="relative">
              <Home className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
            <Music className="w-6 h-6" />
            <span className="text-xs">Music</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
            <Heart className="w-6 h-6" />
            <span className="text-xs">Favorites</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBattleFeed; 