import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

interface Battle {
  id: number;
  title: string;
  total_votes: number;
  song1_votes: number;
  song2_votes: number;
  song1_percentage: number;
  song2_percentage: number;
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

const VotingInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const [voting, setVoting] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState<{ song1?: string; song2?: string }>({});

  useEffect(() => {
    if (id) {
      fetchBattle();
    }
  }, [id]);



  const fetchBattle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/battles/${id}`);
      setBattle(response.data.battle);
      
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



  const handleVote = async (chosenSongId: number) => {
    if (!battle || !user) return;

    try {
      setVoting(true);
      const response = await axios.post(`/battles/${id}/vote`, {
        chosenSongId,
        voteCount
      });

      // Update user's remaining votes
      updateUser({
        votes_remaining_today: response.data.user.votes_remaining_today,
        total_votes_cast: response.data.user.total_votes_cast
      });

      // Navigate to results
      navigate(`/app/results/${id}`);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const adjustVoteCount = (adjustment: number) => {
    const newCount = voteCount + adjustment;
    if (newCount >= 1 && newCount <= Math.min(10, user?.votes_remaining_today || 10)) {
      setVoteCount(newCount);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !battle) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBattle}
            className="btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <p className="text-gray-400">Battle not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/app/battles')}
          className="p-2 hover:bg-background-secondary rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{battle.title}</h1>
          <p className="text-gray-400">Choose your winner</p>
        </div>
      </div>

      {/* Battle Display */}
      <div className="card mb-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Song 1 */}
          <div className="text-center">
            <div className="mb-4">
              <YouTubeVideoPlayer
                songTitle={battle.song1_title}
                artist={battle.song1_artist}
                videoId={youtubeVideoIds.song1}
                className="w-80 h-48 mx-auto"
                onPlay={() => setCurrentlyPlaying(battle.song1_id.toString())}
                onPause={() => setCurrentlyPlaying(null)}
              />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{battle.song1_title}</h3>
            <p className="text-gray-400 mb-2">{battle.song1_artist}</p>
            <div className="text-2xl font-bold text-primary-400">{battle.song1_percentage}%</div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary-400 mb-4">VS</div>
              <div className="text-gray-400 mb-2">Total Votes: {battle.total_votes}</div>
              <div className="text-sm text-gray-500">Hover over videos for controls</div>
            </div>
          </div>

          {/* Song 2 */}
          <div className="text-center">
            <div className="mb-4">
              <YouTubeVideoPlayer
                songTitle={battle.song2_title}
                artist={battle.song2_artist}
                videoId={youtubeVideoIds.song2}
                className="w-80 h-48 mx-auto"
                onPlay={() => setCurrentlyPlaying(battle.song2_id.toString())}
                onPause={() => setCurrentlyPlaying(null)}
              />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{battle.song2_title}</h3>
            <p className="text-gray-400 mb-2">{battle.song2_artist}</p>
            <div className="text-2xl font-bold text-primary-400">{battle.song2_percentage}%</div>
          </div>
        </div>
      </div>

      {/* Vote Allocation */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          How many votes to cast?
        </h3>
        
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={() => adjustVoteCount(-1)}
            disabled={voteCount <= 1}
            className="w-12 h-12 bg-background-tertiary rounded-full flex items-center justify-center text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-400">{voteCount}</div>
            <div className="text-sm text-gray-400">votes</div>
          </div>
          
          <button
            onClick={() => adjustVoteCount(1)}
            disabled={voteCount >= Math.min(10, user?.votes_remaining_today || 10)}
            className="w-12 h-12 bg-background-tertiary rounded-full flex items-center justify-center text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center text-gray-400 mb-6">
          Remaining: {user?.votes_remaining_today || 0}/10 votes
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Voting Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleVote(battle.song1_id)}
            disabled={voting}
            className="btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? 'Voting...' : `Vote for ${battle.song1_title}`}
          </button>
          
          <button
            onClick={() => handleVote(battle.song2_id)}
            disabled={voting}
            className="btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? 'Voting...' : `Vote for ${battle.song2_title}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface; 