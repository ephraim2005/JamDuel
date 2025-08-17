import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowRight, ArrowLeft, Heart, Star } from 'lucide-react';
import axios from 'axios';

interface Song {
  title: string;
  artist: string;
}

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState({ title: '', artist: '' });

  const handleAddSong = () => {
    if (currentSong.title.trim() && currentSong.artist.trim()) {
      setSongs([...songs, currentSong]);
      setCurrentSong({ title: '', artist: '' });
    }
  };

  const handleRemoveSong = (index: number) => {
    setSongs(songs.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    try {
      // Save the songs to the user's profile
      await axios.post('/users/favorite-songs', { songs });
      
      // Navigate to the main app
      navigate('/battles');
    } catch (error) {
      console.error('Failed to save favorite songs:', error);
      alert('Failed to save songs, but continuing to app...');
      navigate('/battles');
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-dark-gradient flex flex-col items-center justify-center p-6">
        {/* 3D Animated Logo */}
        <div className="relative mb-12">
          <div className="w-32 h-32 bg-purple-gradient rounded-full flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
            <Music className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-12 max-w-md">
          <h1 className="text-4xl font-bold gradient-text mb-6 text-shadow">
            Time to learn your sound
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Let's discover what genres speak to you by learning about your favorite music
          </p>
        </div>

        {/* 3D Floating Elements */}
        <div className="relative w-full max-w-md mb-12">
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary-500/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute top-10 right-0 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-0 left-1/4 w-12 h-12 bg-indigo-500/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => setStep(2)}
          className="btn-primary text-lg py-4 px-8 transform hover:scale-105 transition-all duration-200 shadow-2xl"
        >
          Let's Go
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-dark-gradient p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-4 text-shadow">
            Tell us about your taste
          </h2>
          <p className="text-gray-300">
            Add 10 of your favorite songs so we can understand what genres speak to you
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-primary-400 font-medium">{songs.length}/10</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-primary-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${(songs.length / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Add Song Form */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Add a Song</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Song title"
              value={currentSong.title}
              onChange={(e) => setCurrentSong({ ...currentSong, title: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Artist name"
              value={currentSong.artist}
              onChange={(e) => setCurrentSong({ ...currentSong, artist: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleAddSong}
              disabled={!currentSong.title.trim() || !currentSong.artist.trim() || songs.length >= 10}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Add Song
            </button>
          </div>
        </div>

        {/* Songs List */}
        {songs.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Your Songs</h3>
            <div className="space-y-3">
              {songs.map((song, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-xl p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSong(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Back
          </button>
          <button
            onClick={handleComplete}
            disabled={songs.length < 10}
            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {songs.length >= 10 ? 'Complete' : `${10 - songs.length} more songs needed`}
            {songs.length >= 10 && <ArrowRight className="w-5 h-5 inline ml-2" />}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OnboardingFlow; 