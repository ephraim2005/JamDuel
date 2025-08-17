import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music, Users, Clock, Play, Headphones } from 'lucide-react';
import axios from 'axios';
import AudioPlayer from './AudioPlayer';

interface Battle {
  id: number;
  title: string;
  total_votes: number;
  status: string;
  created_at: string;
  ends_at: string;
  song1_id: number;
  song1_title: string;
  song1_artist: string;
  song1_art: string;
  song1_preview: string;
  song2_id: number;
  song2_title: string;
  song2_artist: string;
  song2_art: string;
  song2_preview: string;
}

const BattleFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBattle, setExpandedBattle] = useState<number | null>(null);

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
      setError('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const endTime = new Date(endsAt);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const playPreview = (previewUrl: string) => {
    if (!previewUrl) return;
    
    const audio = new Audio(previewUrl);
    audio.play();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBattles}
            className="btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-gradient rounded-full mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Music Battles</h1>
        <p className="text-gray-400 mb-4">Vote for your favorite songs</p>
        
        {/* Votes Remaining */}
        <div className="bg-background-secondary rounded-xl p-4 border border-background-tertiary">
          <div className="text-2xl font-bold text-primary-400 mb-1">
            {user?.votes_remaining_today || 0}
          </div>
          <div className="text-gray-400 text-sm">votes remaining today</div>
        </div>
      </div>

      {/* Battles */}
      {battles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Active Battles</h3>
          <p className="text-gray-400">Check back later for new music battles!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {battles.map((battle) => (
            <div
              key={battle.id}
              className="card hover:scale-105 transition-transform duration-200"
            >
              {/* Battle Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{battle.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeRemaining(battle.ends_at)}</span>
                </div>
              </div>

              {/* Songs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Song 1 */}
                <div className="text-center">
                  <div className="relative mb-3">
                    <img
                      src={battle.song1_art || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵'}
                      alt={battle.song1_title}
                      className="w-30 h-30 rounded-lg mx-auto"
                    />
                    {battle.song1_preview && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(battle.song1_preview);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-8 h-8 text-white" />
                      </button>
                    )}
                  </div>
                  <h4 className="font-medium text-white text-sm truncate">{battle.song1_title}</h4>
                  <p className="text-gray-400 text-xs truncate">{battle.song1_artist}</p>
                </div>

                {/* VS */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-2">VS</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{battle.total_votes} votes</span>
                    </div>
                  </div>
                </div>

                {/* Song 2 */}
                <div className="text-center">
                  <div className="relative mb-3">
                    <img
                      src={battle.song2_art || 'https://via.placeholder.com/120x120/4C1D95/FFFFFF?text=🎵'}
                      alt={battle.song2_title}
                      className="w-30 h-30 rounded-lg mx-auto"
                    />
                    {battle.song2_preview && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(battle.song2_preview);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-8 h-8 text-white" />
                      </button>
                    )}
                  </div>
                  <h4 className="font-medium text-white text-sm truncate">{battle.song2_title}</h4>
                  <p className="text-gray-400 text-xs truncate">{battle.song2_artist}</p>
                </div>
              </div>

              {/* Audio Player Section */}
              <div className="mt-4 pt-4 border-t border-background-tertiary">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setExpandedBattle(expandedBattle === battle.id ? null : battle.id)}
                    className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Headphones size={16} />
                    <span className="text-sm font-medium">
                      {expandedBattle === battle.id ? 'Hide Preview' : 'Preview Songs'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/battle/${battle.id}`)}
                    className="text-primary-400 hover:text-primary-300 font-medium text-sm"
                  >
                    Vote Now →
                  </button>
                </div>
                
                {/* Expanded Audio Player */}
                {expandedBattle === battle.id && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Song 1 Audio Player */}
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2 text-center">
                          {battle.song1_title}
                        </h4>
                        <AudioPlayer
                          songTitle={battle.song1_title}
                          artist={battle.song1_artist}
                          previewUrl={battle.song1_preview}
                        />
                      </div>
                      
                      {/* Song 2 Audio Player */}
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2 text-center">
                          {battle.song2_title}
                        </h4>
                        <AudioPlayer
                          songTitle={battle.song2_title}
                          artist={battle.song2_artist}
                          previewUrl={battle.song2_preview}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleFeed; 