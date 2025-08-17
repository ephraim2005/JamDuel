import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

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
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isIframeReady, setIsIframeReady] = useState(false);
  
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
    try {
      if (!iframeRef.current || !isIframeReady) return;
      
      const iframe = iframeRef.current;
      const player = (iframe as any).contentWindow;
      
      if (!player) return;
      
      if (isPlaying) {
        player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsPlaying(false);
        onPause?.();
      } else {
        player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.warn('YouTube player control error:', error);
    }
  };

  const toggleMute = () => {
    try {
      if (!iframeRef.current || !isIframeReady) return;
      
      const iframe = iframeRef.current;
      const player = (iframe as any).contentWindow;
      
      if (!player) return;
      
      if (isMuted) {
        player.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        setIsMuted(false);
      } else {
        player.postMessage('{"event":"command","func":"mute","args":""}', '*');
        setIsMuted(true);
      }
    } catch (error) {
      console.warn('YouTube player control error:', error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      
      if (!iframeRef.current || !isIframeReady) return;
      
      const iframe = iframeRef.current;
      const player = (iframe as any).contentWindow;
      
      if (!player) return;
      
      player.postMessage(`{"event":"command","func":"setVolume","args":[${newVolume * 100}]}`, '*');
    } catch (error) {
      console.warn('YouTube player control error:', error);
    }
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
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden transition-all duration-500 ease-out">
        
        {/* YouTube iframe */}
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1&mute=0&volume=${volume * 100}`}
          title={`${songTitle} by ${artist}`}
          className="w-full h-full rounded-2xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={() => setIsIframeReady(true)}
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

          </div>

          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              disabled={!isIframeReady}
              className={`p-4 bg-black/60 backdrop-blur-md rounded-full border border-white/30 text-white transition-all duration-200 transform ${
                isIframeReady 
                  ? 'hover:bg-white/20 hover:scale-110' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {!isIframeReady ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
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
                disabled={!isIframeReady}
                className={`transition-colors ${
                  isIframeReady 
                    ? 'text-white hover:text-gray-300' 
                    : 'text-gray-500 cursor-not-allowed'
                }`}
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
                disabled={!isIframeReady}
                className={`w-20 h-1.5 rounded-lg appearance-none slider ${
                  isIframeReady 
                    ? 'bg-gray-600 cursor-pointer' 
                    : 'bg-gray-800 cursor-not-allowed'
                }`}
                style={{
                  background: isIframeReady 
                    ? `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
                    : '#374151'
                }}
              />
            </div>


          </div>
        </div>

        {/* 3D Border Glow Effect */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>

    </div>
  );
};

export default YouTubeVideoPlayer; 