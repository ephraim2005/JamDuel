import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Minus, Plus, ArrowLeft } from 'lucide-react';
import axios from 'axios';

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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      fetchBattle();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  const fetchBattle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/battles/${id}`);
      setBattle(response.data.battle);
    } catch (error) {
      console.error('Failed to fetch battle:', error);
      setError('Failed to load battle');
    } finally {
      setLoading(false);
    }
  };

  const playPreview = (previewUrl: string, songId: number) => {
    if (!previewUrl) return;

    if (currentlyPlaying === songId.toString()) {
      // Stop current audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setAudio(null);
        setCurrentlyPlaying(null);
      }
    } else {
      // Stop any currently playing audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Play new audio
      const newAudio = new Audio(previewUrl);
      newAudio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
        setAudio(null);
      });
      
      newAudio.play();
      setAudio(newAudio);
      setCurrentlyPlaying(songId.toString());
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
            <div className="relative mb-4">
              <img
                src={battle.song1_art || 'https://via.placeholder.com/160x160/8B5CF6/FFFFFF?text=🎵'}
                alt={battle.song1_title}
                className="w-40 h-40 rounded-xl mx-auto"
              />
              {battle.song1_preview && (
                <button
                  onClick={() => playPreview(battle.song1_preview, battle.song1_id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                >
                  {currentlyPlaying === battle.song1_id.toString() ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </button>
              )}
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
              <div className="text-sm text-gray-500">Tap play buttons to preview</div>
            </div>
          </div>

          {/* Song 2 */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={battle.song2_art || 'https://via.placeholder.com/160x160/4C1D95/FFFFFF?text=🎵'}
                alt={battle.song2_title}
                className="w-40 h-40 rounded-xl mx-auto"
              />
              {battle.song2_preview && (
                <button
                  onClick={() => playPreview(battle.song2_preview, battle.song2_id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                >
                  {currentlyPlaying === battle.song2_id.toString() ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </button>
              )}
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