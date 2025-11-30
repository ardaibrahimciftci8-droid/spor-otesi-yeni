import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StoryViewer = ({ userStories, onClose, currentUserIndex = 0, onViewStory }) => {
  const [currentUser, setCurrentUser] = useState(currentUserIndex);
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const stories = userStories[currentUser]?.stories || [];
  const story = stories[currentStory];

  useEffect(() => {
    if (!story || isPaused) return;

    const duration = story.media_type === 'video' ? story.duration * 1000 : 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    // Mark as viewed
    if (onViewStory) {
      onViewStory(story.id);
    }

    return () => clearInterval(timer);
  }, [currentUser, currentStory, story, isPaused]);

  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(currentStory + 1);
      setProgress(0);
    } else if (currentUser < userStories.length - 1) {
      setCurrentUser(currentUser + 1);
      setCurrentStory(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStory > 0) {
      setCurrentStory(currentStory - 1);
      setProgress(0);
    } else if (currentUser > 0) {
      setCurrentUser(currentUser - 1);
      const prevStories = userStories[currentUser - 1].stories;
      setCurrentStory(prevStories.length - 1);
      setProgress(0);
    }
  };

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{
                width: idx === currentStory ? `${progress}%` : idx < currentStory ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <img
            src={userStories[currentUser].user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'}
            alt={userStories[currentUser].user_name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <span className="text-white font-semibold">{userStories[currentUser].user_name}</span>
          <span className="text-gray-300 text-sm">{new Date(story.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button onClick={onClose} className="text-white">
          <X size={28} />
        </button>
      </div>

      {/* Story Content */}
      <div className="relative w-full max-w-lg h-full flex items-center justify-center">
        {story.media_type === 'image' ? (
          <img
            src={story.media_url}
            alt="Story"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={story.media_url}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        )}

        {/* Navigation */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full" onClick={handlePrevious} />
          <div className="w-1/2 h-full" onClick={handleNext} />
        </div>
      </div>

      {/* Navigation Arrows (Desktop) */}
      {currentUser > 0 && (
        <button
          onClick={handlePrevious}
          className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      {currentUser < userStories.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </motion.div>
  );
};

export default StoryViewer;