import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Pause, Play, Volume2, VolumeX, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReelsViewer = ({ reels, currentIndex, onIndexChange, user, onLike, onComment }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  const currentReel = reels[currentIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [currentIndex]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < reels.length - 1) {
        // Swipe up - next reel
        onIndexChange(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous reel
        onIndexChange(currentIndex - 1);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < reels.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length, onIndexChange]);

  // Mouse wheel navigation
  const handleWheel = (e) => {
    if (e.deltaY > 0 && currentIndex < reels.length - 1) {
      // Scroll down - next reel
      onIndexChange(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      // Scroll up - previous reel
      onIndexChange(currentIndex - 1);
    }
  };

  const handleVideoClick = () => {
    if (isPaused) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
    setIsPaused(!isPaused);
  };

  const handleLike = () => {
    if (onLike && user) {
      onLike(currentReel.id);
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim() && onComment && user) {
      onComment(currentReel.id, comment);
      setComment('');
      setShowComments(false);
    }
  };

  if (!currentReel) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-white text-lg">Henüz Reels yok</p>
      </div>
    );
  }

  const isLiked = user && currentReel.likes?.includes(user.uid);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={currentReel.video_url}
        className="absolute inset-0 w-full h-full object-contain"
        loop
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src={currentReel.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <span className="text-white font-semibold">{currentReel.user_name}</span>
          {user && user.uid !== currentReel.user_id && (
            <button className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full text-sm">
              Takip Et
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-white text-sm font-semibold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {reels.length}
          </div>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
            <MoreVertical size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          <Heart
            size={32}
            className={isLiked ? 'text-red-500 fill-red-500' : 'text-white'}
          />
          <span className="text-white text-xs font-semibold mt-1">
            {currentReel.likes_count || 0}
          </span>
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center"
        >
          <MessageCircle size={32} className="text-white" />
          <span className="text-white text-xs font-semibold mt-1">
            {currentReel.comments_count || 0}
          </span>
        </motion.button>

        {/* Send to Message */}
        <motion.button 
          whileTap={{ scale: 0.8 }} 
          onClick={() => {
            // Open message modal or navigate to messages
            alert('Mesaj gönderme özelliği yakında aktif olacak!');
          }}
          className="flex flex-col items-center"
        >
          <Send size={32} className="text-white" />
          <span className="text-white text-xs font-semibold mt-1">Gönder</span>
        </motion.button>

        {/* Sound */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => setIsMuted(!isMuted)}
          className="flex flex-col items-center"
        >
          {isMuted ? (
            <VolumeX size={28} className="text-white" />
          ) : (
            <Volume2 size={28} className="text-white" />
          )}
        </motion.button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-4 right-20 z-10">
        <p className="text-white text-sm mb-2">
          {currentReel.description || 'Açıklama yok'}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-xs">
            🎵 {currentReel.music || 'Original Audio'}
          </span>
        </div>
      </div>

      {/* Pause Icon */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Pause size={64} className="text-white/80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto z-20"
          >
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-4">
              Yorumlar ({currentReel.comments_count || 0})
            </h3>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleSubmitComment} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Yorum yap..."
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="p-2 bg-yellow-500 text-black rounded-full disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            )}

            <button
              onClick={() => setShowComments(false)}
              className="mt-4 w-full py-2 text-gray-400 hover:text-white"
            >
              Kapat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelsViewer;
