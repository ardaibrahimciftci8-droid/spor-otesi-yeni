import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share, Trash2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

const PostCard = ({ post, user, onDelete, onViewProfile }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  useEffect(() => {
    if (user) {
      api.checkLiked(post.id, user.uid).then(res => setLiked(res.is_liked)).catch(() => {});
    }
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return;
    try {
      if (liked) {
        await api.unlikePost(post.id, user.uid);
        setLikesCount(prev => prev - 1);
      } else {
        await api.likePost(post.id, user.uid);
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (e) { console.error(e); }
  };

  const handleDoubleTap = () => {
    if (!user || liked) return;
    handleLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const res = await api.savePost(post.id, user.uid);
      setSaved(res.saved);
    } catch (e) { console.error(e); }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(post.id);
      setComments(data);
    } catch (e) { console.error(e); }
  };

  const handleShowComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      const comment = await api.createComment({
        post_id: post.id, user_id: user.uid, user_name: user.displayName,
        user_photo: user.photoURL, content: newComment
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (e) { console.error(e); }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
    return `${Math.floor(diff / 86400)} gün`;
  };

  const formatContent = (text) => {
    if (!text) return '';
    return text.replace(/#(\w+)/g, '<span class="text-blue-400 font-semibold">#$1</span>')
               .replace(/@(\w+)/g, '<span class="text-yellow-500 font-semibold">@$1</span>');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl mb-4 overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile && onViewProfile(post.user_id)}>
          <img src={post.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'} alt="" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h4 className="font-semibold text-white text-sm hover:text-gray-300 transition">{post.user_name}</h4>
            {post.location && (
              <p className="text-xs text-gray-400">{post.location}</p>
            )}
          </div>
        </div>
        {user?.uid === post.user_id && (
          <button onClick={() => onDelete && onDelete(post.id)} className="text-gray-400 hover:text-red-500 transition">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="relative bg-black" onDoubleClick={handleDoubleTap}>
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls className="w-full max-h-[600px] object-contain" />
          ) : (
            <img src={post.media_url} alt="" className="w-full max-h-[600px] object-contain" />
          )}
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={100} fill="white" className="text-white" />
            </motion.div>
          )}
        </div>
      )}

      {/* Actions - Instagram Style */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className={`transition ${liked ? 'text-red-500 scale-110' : 'text-white hover:text-gray-400'}`}>
              <Heart size={26} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 2} />
            </button>
            <button onClick={handleShowComments} className="text-white hover:text-gray-400 transition">
              <MessageSquare size={26} />
            </button>
            <button className="text-white hover:text-gray-400 transition">
              <Share size={26} />
            </button>
          </div>
          {user && (
            <button onClick={handleSave} className={`transition ${saved ? 'text-yellow-500' : 'text-white hover:text-gray-400'}`}>
              <Bookmark size={26} fill={saved ? 'currentColor' : 'none'} strokeWidth={saved ? 0 : 2} />
            </button>
          )}
        </div>

        {/* Likes Count */}
        <div className="mb-2">
          <span className="font-semibold text-white text-sm">{likesCount} beğeni</span>
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span 
            className="font-semibold text-white mr-2 cursor-pointer hover:text-gray-300 transition"
            onClick={() => onViewProfile && onViewProfile(post.user_id)}
          >
            {post.user_name}
          </span>
          <span className="text-gray-200" dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
        </div>

        {/* View Comments */}
        {post.comments_count > 0 && !showComments && (
          <button onClick={handleShowComments} className="text-gray-400 text-sm mt-1 hover:text-gray-300">
            {post.comments_count} yorumun tümünü gör
          </button>
        )}

        {/* Time */}
        <div className="text-xs text-gray-500 mt-1 uppercase">
          {timeAgo(post.created_at)}
        </div>
      </div>

      {/* Comments Section - Instagram Style */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 overflow-hidden">
            <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-white mr-2">{comment.user_name}</span>
                    <span className="text-sm text-gray-200">{comment.content}</span>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Henüz yorum yok</p>}
            </div>
            {user && (
              <form onSubmit={handleSubmitComment} className="p-3 border-t border-white/10 flex gap-2 items-center">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Yorum ekle..." className="flex-1 bg-transparent text-white text-sm focus:outline-none" />
                <button type="submit" disabled={!newComment.trim()} className="text-blue-500 font-semibold text-sm disabled:opacity-30 hover:text-blue-400 transition">
                  Paylaş
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;