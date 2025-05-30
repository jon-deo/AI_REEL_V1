'use client';

import { useState, useEffect, useRef } from 'react';
import ReelCard from './ReelCard';

interface Reel {
  id: number;
  title: string;
  celebrity_name: string;
  sport: string;
  video_url: string;
  thumbnail_url?: string;
}

const ReelViewer = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Fetch reels from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reels');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reels');
        }
        
        const data = await response.json();
        setReels(data);
      } catch (err) {
        setError('Failed to load reels. Please try again later.');
        console.error('Error fetching reels:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Handle scroll to update active reel with improved accuracy
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (reels.length === 0 || !containerRef.current || isScrolling) return;
    
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const reelHeight = container.clientHeight;
    
    // Calculate active reel index based on scroll position
    const index = Math.round(scrollPosition / reelHeight);
    const newIndex = Math.min(Math.max(0, index), reels.length - 1);
    
    if (newIndex !== activeReelIndex) {
      setActiveReelIndex(newIndex);
    }
  };

  // Function to scroll to a reel
  const scrollToReel = (index: number) => {
    if (!containerRef.current) return;
    
    setIsScrolling(true);
    setActiveReelIndex(index);
    
    containerRef.current.scrollTo({
      top: index * containerRef.current.clientHeight,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  };

  // Handle wheel event for smoother scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current || isScrolling) return;
    
    // Require minimum threshold to prevent accidental scrolls
    if (Math.abs(e.deltaY) < 30) return;
    
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.min(Math.max(0, activeReelIndex + direction), reels.length - 1);
    
    if (nextIndex !== activeReelIndex) {
      scrollToReel(nextIndex);
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isScrolling) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Require a minimum swipe distance
    if (Math.abs(diff) < 50) return;
    
    const direction = diff > 0 ? 1 : -1;
    const nextIndex = Math.min(Math.max(0, activeReelIndex + direction), reels.length - 1);
    
    if (nextIndex !== activeReelIndex) {
      scrollToReel(nextIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || reels.length === 0 || isScrolling) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const nextIndex = Math.min(activeReelIndex + 1, reels.length - 1);
        scrollToReel(nextIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const prevIndex = Math.max(activeReelIndex - 1, 0);
        scrollToReel(prevIndex);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeReelIndex, reels.length, isLoading, isScrolling]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center p-4">
          <p className="text-xl">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-white text-black rounded-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center p-4">
          <p className="text-xl">No reels available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide touch-none"
      onScroll={handleScroll}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {reels.map((reel, index) => (
        <ReelCard
          key={reel.id}
          {...reel}
          isActive={index === activeReelIndex}
        />
      ))}
    </div>
  );
};

export default ReelViewer; 