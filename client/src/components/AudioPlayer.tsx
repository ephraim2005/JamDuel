import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  songTitle: string;
  artist: string;
  previewUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  songTitle, 
  artist, 
  previewUrl, 
  onPlay, 
  onPause 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60); // 1 minute default
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Handle time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 60);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Handle skip
  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md mx-auto">
      {/* Song Info */}
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold text-lg">{songTitle}</h3>
        <p className="text-gray-400 text-sm">{artist}</p>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="metadata"
        onError={() => console.log('Audio preview not available')}
      />

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          ref={progressRef}
          className="w-full bg-gray-600 rounded-full h-2 cursor-pointer relative"
          onClick={handleSeek}
        >
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-0 w-4 h-4 bg-purple-500 rounded-full -mt-1 cursor-pointer transform -translate-x-2"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={() => skip(-10)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Skip Back 10s"
        >
          <SkipBack size={20} />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={() => skip(10)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Skip Forward 10s"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Volume"
        >
          <Volume2 size={18} />
        </button>
        
        {showVolume && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        )}
      </div>

      {/* Preview Notice */}
      {!previewUrl && (
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            Preview not available - this is a demo player
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer; 