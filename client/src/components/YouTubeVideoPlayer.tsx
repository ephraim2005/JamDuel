import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize2, Volume2, VolumeX, Settings } from 'lucide-react';

interface YouTubeVideoPlayerProps {
  songTitle: string;
  artist: string;
  videoId?: string;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({ 
  songTitle, 
  artist, 
  videoId, 
  onPlay, 
  onPause,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // YouTube Player API
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube Player API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      new (window as any).YT.Player(playerRef.current!, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          cc_load_policy: 0,
          playsinline: 1,
          mute: 0,
          volume: volume * 100
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              onPlay?.();
            } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              onPause?.();
            }
          }
        }
      });
    };

    return () => {
      // Cleanup
      if ((window as any).onYouTubeIframeAPIReady) {
        delete (window as any).onYouTubeIframeAPIReady;
      }
    };
  }, [videoId, onPlay, onPause]);

  const togglePlay = () => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const player = (iframe as any).contentWindow;
    
    if (isPlaying) {
      player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      setIsPlaying(false);
      onPause?.();
    } else {
      player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const toggleMute = () => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const player = (iframe as any).contentWindow;
    
    if (isMuted) {
      player.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      setIsMuted(false);
    } else {
      player.postMessage('{"event":"command","func":"mute","args":""}', '*');
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const player = (iframe as any).contentWindow;
    player.postMessage(`{"event":"command","func":"setVolume","args":[${newVolume * 100}]}`, '*');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!videoId) {
    return (
      <div className={`relative group ${className}`}>
        {/* Placeholder with 3D effect */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 shadow-2xl">
          {/* 3D Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[linear-gradient(90deg,transparent_50%,rgba(255,255,255,0.1)_50%),linear-gradient(0deg,transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:20px_20px]"></div>
          </div>
          
          {/* Glassmorphism Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 mb-4">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg text-center mb-2">{songTitle}</h3>
            <p className="text-gray-300 text-sm text-center">{artist}</p>
            <p className="text-gray-400 text-xs text-center mt-2">Video preview not available</p>
          </div>
          
          {/* 3D Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Video Container with 3D Effects */}
      <div className={`relative transition-all duration-500 ease-out ${
        isExpanded 
          ? 'w-screen h-screen fixed inset-0 z-50 bg-black/95' 
          : 'w-full aspect-video rounded-2xl overflow-hidden'
      }`}>
        
        {/* YouTube iframe */}
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1&mute=0&volume=${volume * 100}`}
          title={`${songTitle} by ${artist}`}
          className="w-full h-full rounded-2xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />

        {/* 3D Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
          {/* Top Controls Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            {/* Song Info */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
              <h3 className="text-white font-semibold text-sm">{songTitle}</h3>
              <p className="text-gray-300 text-xs">{artist}</p>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {/* Expand Button */}
              <button
                onClick={toggleExpand}
                className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-4 bg-black/60 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 transform"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            {/* Volume Control */}
            <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
                }}
              />
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[200px]">
                <h4 className="text-white font-semibold text-sm mb-3">Player Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-300 text-xs block mb-1">Quality</label>
                    <select className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600">
                      <option>Auto</option>
                      <option>1080p</option>
                      <option>720p</option>
                      <option>480p</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1">Playback Speed</label>
                    <select className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600">
                      <option>Normal</option>
                      <option>0.75x</option>
                      <option>1.25x</option>
                      <option>1.5x</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3D Border Glow Effect */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>

      {/* Floating Song Info Card (when not expanded) */}
      {!isExpanded && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20 shadow-2xl">
          <h3 className="text-white font-semibold text-center text-sm">{songTitle}</h3>
          <p className="text-gray-300 text-center text-xs">{artist}</p>
        </div>
      )}


    </div>
  );
};

export default YouTubeVideoPlayer; 