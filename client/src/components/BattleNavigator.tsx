import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import axios from 'axios';

interface Battle {
  id: number;
  title: string;
}

const BattleNavigator: React.FC = () => {
  const navigate = useNavigate();
  const { battleId } = useParams<{ battleId: string }>();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattles();
  }, []);

  useEffect(() => {
    if (battleId && battles.length > 0) {
      const index = battles.findIndex(battle => battle.id === parseInt(battleId));
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [battleId, battles]);

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

  const goToBattle = (index: number) => {
    if (index >= 0 && index < battles.length) {
      setCurrentIndex(index);
      navigate(`/battle/${battles[index].id}`);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      goToBattle(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < battles.length - 1) {
      goToBattle(currentIndex + 1);
    }
  };

  if (loading || battles.length === 0) {
    return null;
  }

  return (
    <div className="px-6 pb-6">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4">
        {/* Battle Title */}
        <div className="text-center mb-4">
          <h3 className="text-white font-medium text-sm truncate">
            {battles[currentIndex]?.title || 'Battle'}
          </h3>
          <p className="text-gray-400 text-xs">
            {currentIndex + 1} of {battles.length}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Pagination Dots */}
          <div className="flex items-center space-x-2">
            {battles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBattle(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-primary-500' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === battles.length - 1}
            className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleNavigator; 