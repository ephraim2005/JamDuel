import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music, Users, Trophy, Play } from 'lucide-react';
import axios from 'axios';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [youtubeThumbnails, setYoutubeThumbnails] = useState<{ [key: string]: string }>({});

  // Fetch YouTube thumbnails for sample battles
  useEffect(() => {
    const fetchYouTubeThumbnails = async () => {
      try {
        const thumbnails: { [key: string]: string } = {};
        
        const sampleBattles = [
          {
            id: 1,
            song1: { title: "Bohemian Rhapsody", artist: "Queen" },
            song2: { title: "Stairway to Heaven", artist: "Led Zeppelin" },
            votes: 156
          },
          {
            id: 2,
            song1: { title: "Hotel California", artist: "Eagles" },
            song2: { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
            votes: 89
          },
          {
            id: 3,
            song1: { title: "Imagine", artist: "John Lennon" },
            song2: { title: "What's Going On", artist: "Marvin Gaye" },
            votes: 203
          }
        ];
        
        for (const battle of sampleBattles) {
          try {
            // Fetch YouTube thumbnail for song 1
            const song1Response = await axios.get(`/youtube/search?q=${encodeURIComponent(battle.song1.title)}&artist=${encodeURIComponent(battle.song1.artist)}`);
            
            // Fetch YouTube thumbnail for song 2
            const song2Response = await axios.get(`/youtube/search?q=${encodeURIComponent(battle.song2.title)}&artist=${encodeURIComponent(battle.song2.artist)}`);
            
            thumbnails[`${battle.song1.title}-${battle.song1.artist}`] = song1Response.data.thumbnail;
            thumbnails[`${battle.song2.title}-${battle.song2.artist}`] = song2Response.data.thumbnail;
          } catch (error) {
            console.error(`Failed to fetch YouTube thumbnails for battle ${battle.id}:`, error);
          }
        }
        
        setYoutubeThumbnails(thumbnails);
      } catch (error) {
        console.error('Failed to fetch YouTube thumbnails:', error);
      }
    };

    fetchYouTubeThumbnails();
  }, []);

  // Redirect authenticated users to the main app
  useEffect(() => {
    if (!loading && user) {
      if (user.total_votes_cast === 0) {
        navigate('/onboarding');
      } else {
        navigate('/battles');
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-gradient rounded-full mb-6 shadow-2xl animate-spin">
            <Music className="w-10 h-10 text-white" />
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show splash screen for authenticated users
  if (user) {
    return null;
  }

  const sampleBattles = [
    {
      id: 1,
      song1: { title: "Bohemian Rhapsody", artist: "Queen" },
      song2: { title: "Stairway to Heaven", artist: "Led Zeppelin" },
      votes: 156
    },
    {
      id: 2,
      song1: { title: "Hotel California", artist: "Eagles" },
      song2: { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
      votes: 89
    },
    {
      id: 3,
      song1: { title: "Imagine", artist: "John Lennon" },
      song2: { title: "What's Going On", artist: "Marvin Gaye" },
      votes: 203
    }
  ];


  return (
    <div className="min-h-screen bg-dark-gradient flex flex-col">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-gradient rounded-full mb-6 shadow-2xl">
          <Music className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-4 text-shadow">
          JamDuel
        </h1>
        <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
          A fast-paced music discovery app where songs go head-to-head in epic battles
        </p>
      </div>

      {/* Sample Battles */}
      <div className="flex-1 px-6 pb-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-white">
          See What's Happening
        </h2>
        
        <div className="space-y-4 max-w-md mx-auto">
          {sampleBattles.map((battle) => (
            <div key={battle.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-primary-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={youtubeThumbnails[`${battle.song1.title}-${battle.song1.artist}`] || 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=🎵'}
                      alt={battle.song1.title}
                      className="w-10 h-10 rounded-lg object-cover shadow-lg"
                    />
                    <div className="absolute -inset-1 bg-primary-500/20 rounded-lg blur-sm"></div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white truncate max-w-20">{battle.song1.title}</p>
                    <p className="text-gray-400 text-xs truncate max-w-20">{battle.song1.artist}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-primary-400 drop-shadow-lg">VS</div>
                  <div className="text-xs text-gray-500">{battle.votes} votes</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-right">
                    <p className="font-medium text-white truncate max-w-20">{battle.song2.title}</p>
                    <p className="text-gray-400 text-xs truncate max-w-20">{battle.song2.artist}</p>
                  </div>
                  <div className="relative">
                    <img 
                      src={youtubeThumbnails[`${battle.song2.title}-${battle.song2.artist}`] || 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=🎵'}
                      alt={battle.song2.title}
                      className="w-10 h-10 rounded-lg object-cover shadow-lg"
                    />
                    <div className="absolute -inset-1 bg-primary-500/20 rounded-lg blur-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          <div className="text-center group">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
              <Play className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400 group-hover:text-primary-300 transition-colors">Video Previews</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400 group-hover:text-primary-300 transition-colors">Daily Voting</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400 group-hover:text-primary-300 transition-colors">Battle Results</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-8">
        <button
          onClick={() => navigate('/register')}
          className="w-full text-lg py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-primary-500/50 border border-primary-400/50"
        >
          Get Started
        </button>
        
        <div className="text-center mt-4">
          <span className="text-gray-400">Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 