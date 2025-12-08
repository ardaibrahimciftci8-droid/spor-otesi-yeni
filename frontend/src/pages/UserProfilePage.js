import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, UserMinus, Grid, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const UserProfilePage = ({ userId, currentUser, onBack, setPage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getUserProfile(userId, currentUser?.uid);
      setProfile(data);
      setFollowing(data.is_following);
    } catch (e) {
      console.error('Profil yüklenemedi:', e);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert('Takip etmek için giriş yapmalısınız');
      return;
    }
    try {
      await api.followUser(userId, currentUser.uid);
      setFollowing(!following);
      // Update follower count
      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            followers_count: profile.user.followers_count + (following ? -1 : 1)
          }
        });
      }
    } catch (e) {
      console.error('Takip hatası:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Kullanıcı bulunamadı</p>
      </div>
    );
  }

  const { user, posts, posts_count } = profile;
  const isOwnProfile = currentUser?.uid === userId;

  return (
    <div className="min-h-screen pb-24">
      <div className="animated-bg" />
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">{user.display_name}</h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start gap-8 mb-8">
          {/* Profile Picture */}
          <img
            src={user.photo_url || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=150'}
            alt={user.display_name}
            className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500/50"
          />

          {/* Stats & Actions */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">{user.display_name}</h2>
              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition ${
                    following
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600'
                  }`}
                >
                  {following ? (
                    <>
                      <UserMinus size={18} />
                      <span>Takipten Çık</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Takip Et</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{posts_count}</div>
                <div className="text-sm text-gray-400">Gönderi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user.followers_count || 0}</div>
                <div className="text-sm text-gray-400">Takipçi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user.following_count || 0}</div>
                <div className="text-sm text-gray-400">Takip</div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-200">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Posts Grid Header */}
        <div className="border-t border-white/10 pt-4 mb-4">
          <div className="flex items-center justify-center gap-2 text-white font-semibold">
            <Grid size={20} />
            <span>GÖNDERİLER</span>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group cursor-pointer"
              >
                {post.media_url ? (
                  post.media_type === 'video' ? (
                    <video
                      src={post.media_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.media_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <p className="text-white text-sm text-center line-clamp-3">{post.content}</p>
                  </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white">
                    <Heart size={20} fill="white" />
                    <span className="font-semibold">{post.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <MessageSquare size={20} fill="white" />
                    <span className="font-semibold">{post.comments_count || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Grid size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Henüz gönderi yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;