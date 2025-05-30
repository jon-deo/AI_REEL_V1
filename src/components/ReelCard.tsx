'use client';

import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface ReelCardProps {
  id: number;
  title: string;
  celebrity_name: string;
  sport: string;
  video_url: string;
  thumbnail_url?: string;
  isActive?: boolean;
}

const ReelCard = ({
  title,
  sport,
  video_url,
  thumbnail_url,
  isActive = false,
}: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  // Control video playback based on visibility and active state
  useEffect(() => {
    if (!videoRef.current) return;

    if (inView && isActive) {
      if (!isPlaying) {
        playVideo();
      }
    } else {
      if (isPlaying) {
        pauseVideo();
      }
    }
  }, [inView, isActive]);

  // Play video function
  const playVideo = () => {
    if (!videoRef.current) return;
    
    videoRef.current.play().catch((error) => {
      console.error('Error playing video:', error);
      setIsPlaying(false);
    });
    setIsPlaying(true);
    
    // Hide controls after play
    setTimeout(() => {
      setShowControls(false);
    }, 1500);
  };

  // Pause video function
  const pauseVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    setShowControls(true);
  };

  // Handle play/pause toggle with visual feedback
  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  // Handle mute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering video play/pause
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  // Show controls on tap
  const handleTap = () => {
    setShowControls(true);
    togglePlay();
    
    // Auto-hide controls after a delay if video is playing
    if (!isPlaying) {
      setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 2000);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="relative w-full h-screen bg-black overflow-hidden snap-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Video container with tap handler */}
      <div 
        className="absolute inset-0 w-full h-full" 
        onClick={handleTap}
      >
        <video
          ref={videoRef}
          src={video_url}
          poster={thumbnail_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />

      {/* Simple Content - Just title and sport */}
      <div className="absolute bottom-6 left-0 p-6 text-white z-10 w-full">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-300">{sport}</p>
      </div>

      {/* Volume control - moved to bottom left */}
      <div className="absolute left-6 bottom-24">
        <button
          className="bg-black bg-opacity-50 rounded-full p-3 text-white"
          onClick={toggleMute}
        >
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {/* Play/Pause indicator in center */}
      {(!isPlaying || showControls) && (
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={togglePlay}
        >
          {isPlaying ? 
            <FaPause size={30} className="text-white" /> : 
            <FaPlay size={30} className="text-white" />
          }
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReelCard; 