import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bookmark, Clock, Users, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import BattleNavigator from './BattleNavigator';

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
  song1_votes: number;
  song2_id: number;
  song2_title: string;
  song2_artist: string;
  song2_art: string;
  song2_preview: string;
  song2_votes: number;
}

const BattlePage: React.FC = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [voteAllocation, setVoteAllocation] = useState({ song1: 0, song2: 0 });
  const [totalVotesUsed, setTotalVotesUsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votesResetTime, setVotesResetTime] = useState('');
  const [youtubeVideoIds, setYoutubeVideoIds] = useState<{ song1?: string; song2?: string }>({});

  useEffect(() => {
    if (battleId) {
      fetchBattle();
    }
  }, [battleId]);

  useEffect(() => {
    // Update time remaining every second
    const timer = setInterval(() => {
      updateTimeRemaining();
      updateVotesResetTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [battle]);

  const fetchBattle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/battles/${battleId}`);
      setBattle(response.data.battle);
      
      // Check if user has already voted
      if (response.data.userVote) {
        const userVote = response.data.userVote;
        setVoteAllocation({
          song1: userVote.song1_votes || 0,
          song2: userVote.song2_votes || 0
        });
        setTotalVotesUsed((userVote.song1_votes || 0) + (userVote.song2_votes || 0));
      }
      
      // Fetch YouTube video IDs for both songs
      if (response.data.battle) {
        await fetchYouTubeVideoIds(response.data.battle);
      }
    } catch (error) {
      console.error('Failed to fetch battle:', error);
      setError('Failed to load battle');
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeVideoIds = async (battleData: Battle) => {
    try {
      // Fetch YouTube video ID for song 1
      const song1Response = await axios.get(`/api/youtube/search?q=${encodeURIComponent(battleData.song1_title)}&artist=${encodeURIComponent(battleData.song1_artist)}`);
      
      // Fetch YouTube video ID for song 2
      const song2Response = await axios.get(`/api/youtube/search?q=${encodeURIComponent(battleData.song2_title)}&artist=${encodeURIComponent(battleData.song2_artist)}`);
      
      setYoutubeVideoIds({
        song1: song1Response.data.videoId,
        song2: song2Response.data.videoId
      });
    } catch (error) {
      console.error('Failed to fetch YouTube video IDs:', error);
      // Don't set error state, just log it - videos will show as placeholders
    }
  };

  const updateTimeRemaining = () => {
    if (!battle) return;
    
    const now = new Date();
    const endTime = new Date(battle.ends_at);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeRemaining('Ended');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m left`);
    } else {
      setTimeRemaining(`${minutes}m left`);
    }
  };

  const updateVotesResetTime = () => {
    if (!user?.daily_reset_time) {
      // If no reset time, calculate based on 24 hours from now
      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setHours(now.getHours() + 24);
      
      const diff = nextReset.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setVotesResetTime(`${hours}h ${minutes}m`);
      return;
    }
    
    const now = new Date();
    const resetTime = new Date(user.daily_reset_time);
    const nextReset = new Date(resetTime);
    nextReset.setDate(nextReset.getDate() + 1);
    
    const diff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setVotesResetTime(`${hours}h ${minutes}m`);
  };

  const handleVoteChange = (song: 'song1' | 'song2', value: number) => {
    const currentTotal = voteAllocation.song1 + voteAllocation.song2;
    const newValue = Math.max(0, Math.min(10, value));
    
    if (song === 'song1') {
      const song2Votes = Math.max(0, Math.min(10 - newValue, voteAllocation.song2));
      setVoteAllocation({ song1: newValue, song2: song2Votes });
      setTotalVotesUsed(newValue + song2Votes);
    } else {
      const song1Votes = Math.max(0, Math.min(10 - newValue, voteAllocation.song1));
      setVoteAllocation({ song1: song1Votes, song2: newValue });
      setTotalVotesUsed(song1Votes + newValue);
    }
  };

  const submitVote = async () => {
    if (!battle || totalVotesUsed === 0) return;
    
    try {
      // Determine which song got more votes
      const chosenSongId = voteAllocation.song1 > voteAllocation.song2 ? battle.song1_id : battle.song2_id;
      const voteCount = Math.max(voteAllocation.song1, voteAllocation.song2);
      
      await axios.post(`/battles/${battle.id}/vote`, {
        chosenSongId: chosenSongId,
        voteCount: voteCount
      });
      
      // Refresh battle data
      fetchBattle();
      
      // Show success message
      alert('Vote submitted successfully!');
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Battle not found'}</p>
          <button onClick={() => navigate('/battles')} className="btn-secondary">
            Back to Battles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={() => navigate('/battles')}
          className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center text-white hover:bg-gray-700/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center text-white hover:bg-gray-700/50 transition-colors">
          <Bookmark size={20} />
        </button>
      </div>

      {/* Enhanced Main Battle Display - Full Width Album Covers */}
      <div className="mb-6">
        <div className="relative w-full h-96 overflow-hidden">
          {/* Full Width Split Screen Design */}
          <div className="absolute inset-0 flex">
            {/* Song 1 - Left Half */}
            <div className="w-1/2 h-full relative">
              <img
                src={battle.song1_art}
                alt={battle.song1_title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              {/* Song 1 Info Overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold drop-shadow-lg">{battle.song1_title}</h3>
                <p className="text-sm opacity-90 drop-shadow-lg">{battle.song1_artist}</p>
              </div>
            </div>
            
            {/* Song 2 - Right Half */}
            <div className="w-1/2 h-full relative">
              <img
                src={battle.song2_art}
                alt={battle.song2_title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              {/* Song 2 Info Overlay */}
              <div className="absolute bottom-4 right-4 text-white text-right">
                <h3 className="text-lg font-bold drop-shadow-lg">{battle.song2_title}</h3>
                <p className="text-sm opacity-90 drop-shadow-lg">{battle.song2_artist}</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Diagonal Divider */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" stroke="white" strokeWidth="1" opacity="0.4"/>
            </svg>
          </div>
          
          {/* VS Badge */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-primary-500 text-white font-bold text-2xl px-6 py-3 rounded-full shadow-2xl border-2 border-white/20">
              VS
            </div>
          </div>
          
          {/* Audio Preview Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => setShowVideoPlayer(!showVideoPlayer)}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl px-6 py-3 text-white font-medium hover:bg-gray-700/90 transition-all duration-200 transform hover:scale-105 shadow-2xl border border-gray-600/50"
            >
              🎬 Watch Music Videos
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {showVideoPlayer && (
        <div className="px-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <YouTubeVideoPlayer
              songTitle={battle.song1_title}
              artist={battle.song1_artist}
              videoId={youtubeVideoIds.song1}
              className="w-full h-48"
            />
            <YouTubeVideoPlayer
              songTitle={battle.song2_title}
              artist={battle.song2_artist}
              videoId={youtubeVideoIds.song2}
              className="w-full h-48"
            />
          </div>
        </div>
      )}

      {/* Battle Info */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span className="text-sm">{timeRemaining}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span className="text-sm">{battle.total_votes.toLocaleString()} Votes</span>
          </div>
        </div>
      </div>

      {/* Enhanced Voting Section */}
      <div className="px-6 mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Cast Your Vote</h3>
          
          <div className="space-y-6">
            {/* Song 1 Voting */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{battle.song1_title}</h4>
                    <p className="text-gray-400 text-sm">{battle.song1_artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">
                    {calculatePercentage(battle.song1_votes, battle.total_votes)}%
                  </div>
                  <div className="text-xs text-gray-500">{battle.song1_votes} votes</div>
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${calculatePercentage(battle.song1_votes, battle.total_votes)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm font-medium">Allocate Votes:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={voteAllocation.song1}
                  onChange={(e) => handleVoteChange('song1', parseInt(e.target.value) || 0)}
                  className="w-20 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-gray-400 text-sm">/ 10</span>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="bg-primary-500 text-white font-bold text-xl px-6 py-2 rounded-full shadow-lg">
                VS
              </div>
            </div>

            {/* Song 2 Voting */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{battle.song2_title}</h4>
                    <p className="text-gray-400 text-sm">{battle.song2_artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">
                    {calculatePercentage(battle.song2_votes, battle.total_votes)}%
                  </div>
                  <div className="text-xs text-gray-500">{battle.song2_votes} votes</div>
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-700 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${calculatePercentage(battle.song2_votes, battle.total_votes)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm font-medium">Allocate Votes:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={voteAllocation.song2}
                  onChange={(e) => handleVoteChange('song2', parseInt(e.target.value) || 0)}
                  className="w-20 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-400">/ 10</span>
              </div>
            </div>
          </div>

          {/* Enhanced Vote Summary */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600/30">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
              <span className="font-medium">Vote Allocation Summary</span>
              <span className="text-primary-400 font-semibold">{totalVotesUsed}/10 used</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(totalVotesUsed / 10) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Votes remaining: {10 - totalVotesUsed}</span>
              <span className={totalVotesUsed > 10 ? 'text-red-400' : 'text-green-400'}>
                {totalVotesUsed > 10 ? 'Over limit!' : 'Perfect!'}
              </span>
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <button
            onClick={submitVote}
            disabled={totalVotesUsed === 0 || totalVotesUsed > 10}
            className="w-full mt-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-2xl hover:shadow-primary-500/30"
          >
            {totalVotesUsed === 0 ? 'Select your votes first' : 
             totalVotesUsed > 10 ? 'Too many votes!' : 
             `Submit ${totalVotesUsed} Vote${totalVotesUsed !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* Enhanced Comment Section */}
      <div className="px-6 mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💬</span>
            </div>
            <h4 className="text-white font-medium">Share Your Thoughts</h4>
          </div>
          <input
            type="text"
            placeholder="What do you think about this battle? Leave a comment..."
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Enhanced Votes Reset Timer */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 text-center shadow-2xl">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-primary-400" />
            </div>
            <div>
              <h4 className="text-primary-400 font-medium text-lg">Daily Vote Reset</h4>
              <p className="text-gray-400 text-sm">Next 10 votes available</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2 font-mono">{votesResetTime || '24h 0m'}</div>
          <div className="w-full bg-gray-600/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-300"></div>
          </div>
        </div>
      </div>

      {/* Battle Navigator */}
      <BattleNavigator />
    </div>
  );
};

export default BattlePage; 