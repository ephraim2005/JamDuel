import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Users, Clock } from 'lucide-react';
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
  song2_id: number;
  song2_title: string;
  song2_artist: string;
  song2_art: string;
}

const ResultsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Failed to fetch battle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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

  const winner = battle.song1_votes > battle.song2_votes ? 'song1' : 'song2';
  const winnerTitle = winner === 'song1' ? battle.song1_title : battle.song2_title;
  const winnerArtist = winner === 'song1' ? battle.song1_artist : battle.song2_artist;
  const winnerArt = winner === 'song1' ? battle.song1_art : battle.song2_art;

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
          <h1 className="text-2xl font-bold text-white">Battle Results</h1>
          <p className="text-gray-400">{battle.title}</p>
        </div>
      </div>

      {/* Winner Announcement */}
      <div className="card text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-6">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Winner!</h2>
        <div className="mb-6">
          <img
            src={winnerArt || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵'}
            alt={winnerTitle}
            className="w-30 h-30 rounded-xl mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-white mb-1">{winnerTitle}</h3>
          <p className="text-gray-400">{winnerArtist}</p>
        </div>
        <p className="text-gray-300">Thanks for voting! Results will be final in 24 hours.</p>
      </div>

      {/* Results Breakdown */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Final Results</h3>
        
        <div className="space-y-6">
          {/* Song 1 */}
          <div className="flex items-center space-x-4">
            <img
              src={battle.song1_art || 'https://via.placeholder.com/80x80/8B5CF6/FFFFFF?text=🎵'}
              alt={battle.song1_title}
              className="w-20 h-20 rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-white">{battle.song1_title}</h4>
              <p className="text-gray-400 text-sm">{battle.song1_artist}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-400">{battle.song1_percentage}%</div>
              <div className="text-sm text-gray-400">{battle.song1_votes} votes</div>
            </div>
          </div>

          {/* Song 2 */}
          <div className="flex items-center space-x-4">
            <img
              src={battle.song2_art || 'https://via.placeholder.com/80x80/4C1D95/FFFFFF?text=🎵'}
              alt={battle.song2_title}
              className="w-20 h-20 rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-white">{battle.song2_title}</h4>
              <p className="text-gray-400 text-sm">{battle.song2_artist}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-400">{battle.song2_percentage}%</div>
              <div className="text-sm text-gray-400">{battle.song2_votes} votes</div>
            </div>
          </div>
        </div>

        {/* Total Stats */}
        <div className="mt-6 pt-6 border-t border-background-tertiary">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-400">{battle.total_votes}</div>
              <div className="text-sm text-gray-400">Total Votes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">
                {Math.abs(battle.song1_votes - battle.song2_votes)}
              </div>
              <div className="text-sm text-gray-400">Vote Difference</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/app/battles')}
          className="btn-primary w-full py-4"
        >
          Back to Battles
        </button>
        
        <button
          onClick={() => navigate('/app/profile')}
          className="btn-secondary w-full py-4"
        >
          View Your Profile
        </button>
      </div>
    </div>
  );
};

export default ResultsView; 