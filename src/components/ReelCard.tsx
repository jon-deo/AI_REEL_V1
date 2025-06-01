'use client';

import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';

interface ReelCardProps {
  title: string;
  celebrity_name: string;
  sport: string;
  video_url: string;
  thumbnail_url?: string;
  isActive?: boolean;
}

const ReelCard = ({
  title,
  celebrity_name,
  sport,
  video_url,
  thumbnail_url,
  isActive = false,
}: ReelCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (videoRef.current) {
      if (inView && isActive) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [inView, isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      ref={ref}
      className="h-screen w-full relative snap-start"
    >
      <video
        ref={videoRef}
        src={video_url}
        poster={thumbnail_url}
        loop
        playsInline
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />
      
      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm opacity-90">{celebrity_name} • {sport}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Restart Button */}
            <button
              onClick={restartVideo}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label="Restart video"
            >
              <FaRedo size={20} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCard; 