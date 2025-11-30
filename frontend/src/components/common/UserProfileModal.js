import React, { useState, useEffect } from 'react';
import { X, MessageCircle, UserPlus, UserMinus, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

const UserProfileModal = ({ userId, onClose, currentUser, onStartChat }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const [profileData, postsData] = await Promise.all([
        api.getUserProfile(userId),
        api.getUserPosts(userId)
      ]);
      setProfile(profileData);
      setPosts(postsData);
      
      if (currentUser) {
        const following = await api.getFollowing(currentUser.uid);
        setIsFollowing(following.some(f => f.firebase_uid === userId));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.unfollowUser(currentUser.uid, userId);
      } else {
        await api.followUser(currentUser.uid, userId);
      }
      setIsFollowing(!isFollowing);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} className="text-white" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={profile.photo_url || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=128&name=' + encodeURIComponent(profile.display_name || 'User')}
                alt=""
                className="w-32 h-32 rounded-full border-4 border-yellow-500 mb-4"
              />
              <h2 className="text-2xl font-bold text-white">{profile.display_name}</h2>
              {profile.bio && <p className="text-gray-400 mt-2">{profile.bio}</p>}
              {profile.is_private && (
                <div className="flex items-center gap-2 text-gray-400 mt-2">
                  <Lock size={16} />
                  <span className="text-sm">Gizli Hesap</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              {currentUser && currentUser.uid !== userId && (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      isFollowing
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600'
                    }`}
                  >
                    {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
                    {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                  </button>
                  <button
                    onClick={() => {
                      onStartChat(profile);
                      onClose();
                    }}
                    className="flex-1 py-3 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} />
                    Mesaj Gönder
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold text-yellow-500">{posts.length}</p>
                <p className="text-sm text-gray-400">Gönderi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{profile.followers_count || 0}</p>
                <p className="text-sm text-gray-400">Takipçi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{profile.following_count || 0}</p>
                <p className="text-sm text-gray-400">Takip</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Son Gönderiler</h3>
              {posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {posts.slice(0, 6).map(post => (
                    <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                      {post.media_url ? (
                        <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs p-2">
                          {post.content.substring(0, 50)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Henüz gönderi yok</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
