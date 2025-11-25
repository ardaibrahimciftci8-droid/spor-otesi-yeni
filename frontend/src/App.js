import React, { useState, useEffect, useRef } from 'react';
import { 
  Facebook, Twitter, Instagram, Youtube, Calendar, User, ArrowRight, Menu, X, Activity, 
  Flame, MessageCircle, PlayCircle, Lock, PlusCircle, LogOut, BrainCircuit, Sparkles, 
  Dumbbell, Utensils, ChefHat, Heart, Wallet, Search, MapPin, Tv, Youtube as YoutubeIcon, 
  Send, Camera, Video, Image, UserPlus, UserMinus, Users, Home, Bell, Settings, Moon,
  Sun, Footprints, Timer, Zap, TrendingUp, Moon as MoonIcon, ChevronLeft, MoreHorizontal,
  Trash2, Edit, Share, Bookmark, ThumbsUp, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import axios from 'axios';
import "./App.css";

// --- CONFIG ---
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const firebaseConfig = {
  apiKey: "AIzaSyBzqEYs6V5oM2RLi1vOorMwgKDoOvqMmnI", 
  authDomain: "sporotesi-a4ee9.firebaseapp.com",
  projectId: "sporotesi-a4ee9",
  storageBucket: "sporotesi-a4ee9.firebasestorage.app",
  messagingSenderId: "715719411524",
  appId: "1:715719411524:web:ead6e98b58bf6c27bff911"
};

let app, auth, googleProvider;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase error:", e);
}

// --- DEMO DATA ---
const TURKEY_CITIES = [
  "Adana", "Ankara", "Antalya", "Bursa", "Denizli", "Diyarbakır", "Eskişehir", 
  "Gaziantep", "İstanbul", "İzmir", "Kayseri", "Konya", "Mersin", "Samsun", "Trabzon"
];

const DEMO_MATCHES = [
  { id: 'd1', sporDali: 'Futbol', takim1: 'Galatasaray', takim2: 'Fenerbahçe', tarih: 'Bu Hafta - 20:00' },
  { id: 'd2', sporDali: 'Futbol', takim1: 'Beşiktaş', takim2: 'Trabzonspor', tarih: 'Bu Hafta - 19:00' },
  { id: 'd3', sporDali: 'Basketbol', takim1: 'Anadolu Efes', takim2: 'Real Madrid', tarih: 'Perşembe - 21:00' },
  { id: 'd4', sporDali: 'Basketbol', takim1: 'Fenerbahçe Beko', takim2: 'Barcelona', tarih: 'Cuma - 20:45' },
];

const ACTIVITY_TYPES = [
  { id: 'running', name: 'Koşu', icon: Footprints, color: 'text-green-500', bg: 'bg-green-500/20' },
  { id: 'walking', name: 'Yürüyüş', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  { id: 'cycling', name: 'Bisiklet', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  { id: 'swimming', name: 'Yüzme', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/20' },
  { id: 'gym', name: 'Fitness', icon: Dumbbell, color: 'text-purple-500', bg: 'bg-purple-500/20' },
  { id: 'yoga', name: 'Yoga', icon: Sparkles, color: 'text-teal-500', bg: 'bg-teal-500/20' },
];

// --- AI Helper ---
async function askGemini(prompt) {
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Sen yardımcı bir spor asistanısın. Türkçe cevap ver. Listeleri maddeler halinde "-" ile başlatarak yaz.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        seed: 42
      }),
    });
    if (!response.ok) throw new Error("AI Servis Hatası");
    return await response.text();
  } catch (error) {
    console.error("AI Hatası:", error);
    return "⚠️ Bağlantı hatası. Lütfen tekrar deneyin.";
  }
}

// --- API Functions ---
const api = {
  // User
  createUser: async (userData) => {
    const res = await axios.post(`${API}/users`, userData);
    return res.data;
  },
  getUser: async (firebaseUid) => {
    try {
      const res = await axios.get(`${API}/users/${firebaseUid}`);
      return res.data;
    } catch (e) {
      return null;
    }
  },
  updateUser: async (firebaseUid, data) => {
    const res = await axios.put(`${API}/users/${firebaseUid}`, data);
    return res.data;
  },
  searchUsers: async (query) => {
    const res = await axios.get(`${API}/users/search/query?q=${query}`);
    return res.data;
  },
  
  // Follow
  followUser: async (followingId, followerId) => {
    const res = await axios.post(`${API}/follow/${followingId}?follower_id=${followerId}`);
    return res.data;
  },
  unfollowUser: async (followingId, followerId) => {
    const res = await axios.delete(`${API}/follow/${followingId}?follower_id=${followerId}`);
    return res.data;
  },
  checkFollowing: async (followingId, followerId) => {
    const res = await axios.get(`${API}/follow/check/${followingId}?follower_id=${followerId}`);
    return res.data;
  },
  getFollowers: async (userId) => {
    const res = await axios.get(`${API}/followers/${userId}`);
    return res.data;
  },
  getFollowing: async (userId) => {
    const res = await axios.get(`${API}/following/${userId}`);
    return res.data;
  },
  
  // Posts
  createPost: async (postData) => {
    const res = await axios.post(`${API}/posts`, postData);
    return res.data;
  },
  getFeed: async (userId, skip = 0) => {
    const url = userId ? `${API}/posts/feed?user_id=${userId}&skip=${skip}` : `${API}/posts/feed?skip=${skip}`;
    const res = await axios.get(url);
    return res.data;
  },
  getUserPosts: async (userId) => {
    const res = await axios.get(`${API}/posts/user/${userId}`);
    return res.data;
  },
  deletePost: async (postId, userId) => {
    const res = await axios.delete(`${API}/posts/${postId}?user_id=${userId}`);
    return res.data;
  },
  
  // Likes
  likePost: async (postId, userId) => {
    const res = await axios.post(`${API}/posts/${postId}/like?user_id=${userId}`);
    return res.data;
  },
  unlikePost: async (postId, userId) => {
    const res = await axios.delete(`${API}/posts/${postId}/like?user_id=${userId}`);
    return res.data;
  },
  checkLiked: async (postId, userId) => {
    const res = await axios.get(`${API}/posts/${postId}/liked?user_id=${userId}`);
    return res.data;
  },
  
  // Comments
  createComment: async (commentData) => {
    const res = await axios.post(`${API}/comments`, commentData);
    return res.data;
  },
  getComments: async (postId) => {
    const res = await axios.get(`${API}/comments/${postId}`);
    return res.data;
  },
  
  // Conversations & Messages
  getOrCreateConversation: async (p1Id, p1Name, p1Photo, p2Id, p2Name, p2Photo) => {
    const res = await axios.post(
      `${API}/conversations?participant2_id=${p2Id}&participant2_name=${encodeURIComponent(p2Name)}&participant2_photo=${encodeURIComponent(p2Photo || '')}`,
      null,
      { params: { participant1_id: p1Id, participant1_name: p1Name, participant1_photo: p1Photo || '' }}
    );
    return res.data;
  },
  getConversations: async (userId) => {
    const res = await axios.get(`${API}/conversations?user_id=${userId}`);
    return res.data;
  },
  sendMessage: async (messageData) => {
    const res = await axios.post(`${API}/messages`, messageData);
    return res.data;
  },
  getMessages: async (conversationId) => {
    const res = await axios.get(`${API}/messages/${conversationId}`);
    return res.data;
  },
  
  // Activities
  createActivity: async (activityData) => {
    const res = await axios.post(`${API}/activities`, activityData);
    return res.data;
  },
  getActivities: async (userId) => {
    const res = await axios.get(`${API}/activities/${userId}`);
    return res.data;
  },
  getActivityStats: async (userId, days = 7) => {
    const res = await axios.get(`${API}/activities/${userId}/stats?days=${days}`);
    return res.data;
  },
  deleteActivity: async (activityId, userId) => {
    const res = await axios.delete(`${API}/activities/${activityId}?user_id=${userId}`);
    return res.data;
  },
  
  // Sleep
  createSleepRecord: async (sleepData) => {
    const res = await axios.post(`${API}/sleep`, sleepData);
    return res.data;
  },
  getSleepRecords: async (userId) => {
    const res = await axios.get(`${API}/sleep/${userId}`);
    return res.data;
  },
  getSleepStats: async (userId, days = 7) => {
    const res = await axios.get(`${API}/sleep/${userId}/stats?days=${days}`);
    return res.data;
  },
  
  // AI Analysis
  analyzeActivity: async (userId) => {
    const res = await axios.post(`${API}/ai/analyze-activity?user_id=${userId}`);
    return res.data;
  },
  
  // Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API}/upload/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API}/upload/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
};

// --- COMPONENTS ---

// Navigation Bar
const NavBar = ({ user, setPage, currentPage, onLogout }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Ana Sayfa' },
    { id: 'social', icon: Users, label: 'Sosyal' },
    { id: 'tracker', icon: Activity, label: 'Takip' },
    { id: 'messages', icon: MessageCircle, label: 'Mesajlar' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Desktop only */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
            <span className="text-2xl font-black font-montserrat text-yellow-500">SPOR ÖTESİ</span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center justify-around w-full md:w-auto md:gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                data-testid={`nav-${item.id}`}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 rounded-xl transition-all ${
                  currentPage === item.id 
                    ? 'text-yellow-500 bg-yellow-500/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage('profile')}
                  className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-xl transition"
                >
                  <img 
                    src={user.photoURL || 'https://via.placeholder.com/40'} 
                    alt="" 
                    className="w-8 h-8 rounded-full border-2 border-yellow-500"
                  />
                  <span className="text-sm text-gray-300">{user.displayName?.split(' ')[0]}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPage('login')}
                data-testid="login-btn"
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold transition"
              >
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Post Card Component
const PostCard = ({ post, user, onLike, onComment, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      console.error(e);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(post.id);
      setComments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShowComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);
    try {
      const comment = await api.createComment({
        post_id: post.id,
        user_id: user.uid,
        user_name: user.displayName,
        user_photo: user.photoURL,
        content: newComment
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
    return `${Math.floor(diff / 86400)} gün`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="post-card"
      data-testid={`post-${post.id}`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.user_photo || 'https://via.placeholder.com/48'} 
            alt="" 
            className="w-12 h-12 rounded-full border-2 border-gray-700"
          />
          <div>
            <h4 className="font-bold text-white">{post.user_name}</h4>
            <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
          </div>
        </div>
        {user?.uid === post.user_id && (
          <button 
            onClick={() => onDelete && onDelete(post.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="relative">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls className="w-full max-h-[500px] object-cover" />
          ) : (
            <img src={post.media_url} alt="" className="w-full max-h-[500px] object-cover" />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center gap-6 border-t border-gray-800">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        >
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>
        <button 
          onClick={handleShowComments}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition"
        >
          <MessageSquare size={22} />
          <span className="text-sm font-medium">{post.comments_count || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
          <Share size={22} />
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-800 overflow-hidden"
          >
            <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img 
                    src={comment.user_photo || 'https://via.placeholder.com/32'} 
                    alt="" 
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 bg-gray-800 rounded-xl p-3">
                    <span className="font-medium text-sm text-yellow-500">{comment.user_name}</span>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-gray-500 text-sm">Henüz yorum yok</p>
              )}
            </div>
            {user && (
              <form onSubmit={handleSubmitComment} className="p-4 pt-0 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorum yaz..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={loading || !newComment.trim()}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-full transition disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Create Post Modal
const CreatePostModal = ({ user, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      alert('Sadece resim veya video yükleyebilirsiniz');
      return;
    }

    setMedia(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    setLoading(true);
    try {
      let mediaUrl = null;

      if (media) {
        if (mediaType === 'video') {
          const res = await api.uploadVideo(media);
          mediaUrl = res.url;
        } else {
          const res = await api.uploadImage(media);
          mediaUrl = res.url;
        }
      }

      const post = await api.createPost({
        user_id: user.uid,
        user_name: user.displayName,
        user_photo: user.photoURL,
        content,
        media_url: mediaUrl,
        media_type: mediaType
      });

      onPostCreated(post);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Gönderi oluşturulurken hata oluştu');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Yeni Gönderi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-3">
            <img 
              src={user?.photoURL || 'https://via.placeholder.com/48'} 
              alt="" 
              className="w-12 h-12 rounded-full border-2 border-gray-700"
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Ne düşünüyorsun?"
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg"
              rows={4}
            />
          </div>

          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden bg-gray-800">
              {mediaType === 'video' ? (
                <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
              ) : (
                <img src={mediaPreview} alt="" className="w-full max-h-64 object-cover" />
              )}
              <button
                type="button"
                onClick={() => { setMedia(null); setMediaPreview(null); setMediaType(null); }}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition"
              >
                <Image size={22} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
              >
                <Video size={22} />
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || (!content.trim() && !media)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full font-bold transition disabled:opacity-50"
            >
              {loading ? 'Paylaşılıyor...' : 'Paylaş'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// User Card Component
const UserCard = ({ profile, currentUser, onFollow, onMessage, onViewProfile }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && profile.firebase_uid !== currentUser.uid) {
      api.checkFollowing(profile.firebase_uid, currentUser.uid)
        .then(res => setIsFollowing(res.is_following))
        .catch(() => {});
    }
  }, [profile.firebase_uid, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await api.unfollowUser(profile.firebase_uid, currentUser.uid);
      } else {
        await api.followUser(profile.firebase_uid, currentUser.uid);
      }
      setIsFollowing(!isFollowing);
      if (onFollow) onFollow();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onViewProfile}>
        <img 
          src={profile.photo_url || 'https://via.placeholder.com/48'} 
          alt="" 
          className="w-12 h-12 rounded-full border-2 border-gray-700"
        />
        <div>
          <h4 className="font-bold text-white">{profile.display_name}</h4>
          <p className="text-sm text-gray-400">{profile.followers_count || 0} takipçi</p>
        </div>
      </div>
      {currentUser && profile.firebase_uid !== currentUser.uid && (
        <div className="flex gap-2">
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              isFollowing 
                ? 'bg-gray-700 text-gray-300 hover:bg-red-500/20 hover:text-red-500' 
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {loading ? '...' : (isFollowing ? 'Takipten Çık' : 'Takip Et')}
          </button>
          {onMessage && (
            <button
              onClick={onMessage}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 transition"
            >
              <MessageCircle size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --- PAGES ---

// Social Feed Page
const SocialPage = ({ user, setPage, setViewUserId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getFeed(user?.uid);
      setPosts(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const results = await api.searchUsers(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deletePost(postId, user.uid);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20" data-testid="social-page">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Sosyal</h1>
          <p className="text-gray-400">Sporcularla bağlan, paylaş, ilham ol</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kullanıcı ara..."
              className="w-full bg-gray-900 border border-gray-800 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-500 outline-none"
            />
          </div>
        </form>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Arama Sonuçları</h3>
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {searchResults.map(profile => (
              <UserCard
                key={profile.id}
                profile={profile}
                currentUser={user}
                onViewProfile={() => {
                  setViewUserId(profile.firebase_uid);
                  setPage('userProfile');
                }}
              />
            ))}
          </div>
        )}

        {/* Create Post Button */}
        {user && (
          <button
            onClick={() => setShowCreatePost(true)}
            data-testid="create-post-btn"
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 mb-6 hover:border-gray-700 transition"
          >
            <img 
              src={user.photoURL || 'https://via.placeholder.com/48'} 
              alt="" 
              className="w-12 h-12 rounded-full border-2 border-gray-700"
            />
            <span className="text-gray-500">Ne düşünüyorsun?</span>
          </button>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                user={user} 
                onDelete={handleDeletePost}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">Henüz paylaşım yok</p>
              {user && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full font-bold transition"
                >
                  İlk paylaşımı yap!
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && user && (
          <CreatePostModal
            user={user}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Activity Tracker Page
const TrackerPage = ({ user, setPage }) => {
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [sleepRecords, setSleepRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [sleepStats, setSleepStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Activity form
  const [activityForm, setActivityForm] = useState({
    activity_type: 'running',
    duration_minutes: '',
    distance_km: '',
    calories_burned: '',
    notes: ''
  });

  // Sleep form
  const [sleepForm, setSleepForm] = useState({
    sleep_start: '',
    sleep_end: '',
    quality: 3,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesData, sleepData, statsData, sleepStatsData] = await Promise.all([
        api.getActivities(user.uid),
        api.getSleepRecords(user.uid),
        api.getActivityStats(user.uid, 7),
        api.getSleepStats(user.uid, 7)
      ]);
      setActivities(activitiesData);
      setSleepRecords(sleepData);
      setStats(statsData);
      setSleepStats(sleepStatsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.duration_minutes) return;
    
    try {
      const activity = await api.createActivity({
        user_id: user.uid,
        activity_type: activityForm.activity_type,
        duration_minutes: parseInt(activityForm.duration_minutes),
        distance_km: activityForm.distance_km ? parseFloat(activityForm.distance_km) : null,
        calories_burned: activityForm.calories_burned ? parseInt(activityForm.calories_burned) : null,
        notes: activityForm.notes || null
      });
      setActivities([activity, ...activities]);
      setShowAddActivity(false);
      setActivityForm({ activity_type: 'running', duration_minutes: '', distance_km: '', calories_burned: '', notes: '' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    if (!sleepForm.sleep_start || !sleepForm.sleep_end) return;
    
    try {
      const record = await api.createSleepRecord({
        user_id: user.uid,
        sleep_start: new Date(sleepForm.sleep_start).toISOString(),
        sleep_end: new Date(sleepForm.sleep_end).toISOString(),
        quality: sleepForm.quality,
        notes: sleepForm.notes || null
      });
      setSleepRecords([record, ...sleepRecords]);
      setShowAddSleep(false);
      setSleepForm({ sleep_start: '', sleep_end: '', quality: 3, notes: '' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Bu aktiviteyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteActivity(activityId, user.uid);
      setActivities(activities.filter(a => a.id !== activityId));
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const getAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await api.analyzeActivity(user.uid);
      setAiAnalysis(res.analysis);
    } catch (e) {
      console.error(e);
      setAiAnalysis('Analiz yapılamadı. Lütfen tekrar deneyin.');
    }
    setAiLoading(false);
  };

  const getActivityIcon = (type) => {
    const found = ACTIVITY_TYPES.find(a => a.id === type);
    return found || ACTIVITY_TYPES[0];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pb-20 md:pb-0 md:pt-20">
        <div className="text-center">
          <Activity size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Aktivitelerini takip etmek için giriş yap</p>
          <button
            onClick={() => setPage('login')}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20" data-testid="tracker-page">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Egzersiz Takibi</h1>
          <p className="text-gray-400">Aktivitelerini ve uyku düzenini takip et</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stats-card">
              <Footprints className="text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.total_activities}</p>
              <p className="text-sm text-gray-400">Aktivite</p>
            </div>
            <div className="stats-card">
              <Timer className="text-blue-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.total_duration_minutes}</p>
              <p className="text-sm text-gray-400">Dakika</p>
            </div>
            <div className="stats-card">
              <TrendingUp className="text-yellow-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.total_distance_km}</p>
              <p className="text-sm text-gray-400">km</p>
            </div>
            <div className="stats-card">
              <Flame className="text-orange-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.total_calories_burned}</p>
              <p className="text-sm text-gray-400">kcal</p>
            </div>
          </div>
        )}

        {/* Sleep Stats */}
        {sleepStats && sleepStats.total_records > 0 && (
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 mb-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <MoonIcon className="text-purple-400" size={24} />
              <h3 className="text-lg font-bold text-white">Uyku Özeti (Son 7 Gün)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold text-white">{sleepStats.average_duration_hours}</p>
                <p className="text-sm text-gray-400">Ort. Uyku Süresi (saat)</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{sleepStats.average_quality}/5</p>
                <p className="text-sm text-gray-400">Ort. Uyku Kalitesi</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-yellow-500" size={24} />
              <h3 className="text-lg font-bold text-white">AI Analizi</h3>
            </div>
            <button
              onClick={getAIAnalysis}
              disabled={aiLoading}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold transition text-sm disabled:opacity-50"
            >
              {aiLoading ? 'Analiz Ediliyor...' : 'Analiz Al'}
            </button>
          </div>
          {aiAnalysis ? (
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line">
              {aiAnalysis}
            </div>
          ) : (
            <p className="text-gray-500">AI analizini almak için butona tıklayın</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              activeTab === 'activities' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Activity size={20} className="inline mr-2" />
            Aktiviteler
          </button>
          <button
            onClick={() => setActiveTab('sleep')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              activeTab === 'sleep' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <MoonIcon size={20} className="inline mr-2" />
            Uyku
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={() => activeTab === 'activities' ? setShowAddActivity(true) : setShowAddSleep(true)}
          className={`w-full py-4 rounded-xl font-bold transition mb-6 flex items-center justify-center gap-2 ${
            activeTab === 'activities'
              ? 'bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30'
              : 'bg-purple-500/20 text-purple-500 border border-purple-500/30 hover:bg-purple-500/30'
          }`}
        >
          <PlusCircle size={20} />
          {activeTab === 'activities' ? 'Aktivite Ekle' : 'Uyku Kaydı Ekle'}
        </button>

        {/* Content */}
        {activeTab === 'activities' ? (
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map(activity => {
                const actType = getActivityIcon(activity.activity_type);
                const IconComp = actType.icon;
                return (
                  <div key={activity.id} className="activity-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${actType.bg}`}>
                        <IconComp size={24} className={actType.color} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{actType.name}</h4>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>{activity.duration_minutes} dk</span>
                          {activity.distance_km && <span>{activity.distance_km} km</span>}
                          {activity.calories_burned && <span>{activity.calories_burned} kcal</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz aktivite kaydınız yok</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sleepRecords.length > 0 ? (
              sleepRecords.map(record => (
                <div key={record.id} className="activity-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                      <MoonIcon size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{record.duration_hours} saat uyku</h4>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>Kalite: {record.quality}/5</span>
                        {record.notes && <span>{record.notes}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <MoonIcon size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz uyku kaydınız yok</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddActivity(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Aktivite Ekle</h3>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Aktivite Türü</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ACTIVITY_TYPES.map(type => {
                      const IconComp = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setActivityForm({...activityForm, activity_type: type.id})}
                          className={`p-3 rounded-xl border transition flex flex-col items-center gap-1 ${
                            activityForm.activity_type === type.id
                              ? `${type.bg} border-current ${type.color}`
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <IconComp size={20} />
                          <span className="text-xs">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Süre (dk) *</label>
                    <input
                      type="number"
                      value={activityForm.duration_minutes}
                      onChange={e => setActivityForm({...activityForm, duration_minutes: e.target.value})}
                      className="input-dark"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Mesafe (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={activityForm.distance_km}
                      onChange={e => setActivityForm({...activityForm, distance_km: e.target.value})}
                      className="input-dark"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Kalori (kcal)</label>
                  <input
                    type="number"
                    value={activityForm.calories_burned}
                    onChange={e => setActivityForm({...activityForm, calories_burned: e.target.value})}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notlar</label>
                  <textarea
                    value={activityForm.notes}
                    onChange={e => setActivityForm({...activityForm, notes: e.target.value})}
                    className="input-dark resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddActivity(false)}
                    className="flex-1 btn-secondary"
                  >
                    İptal
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sleep Modal */}
      <AnimatePresence>
        {showAddSleep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddSleep(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Uyku Kaydı Ekle</h3>
              <form onSubmit={handleAddSleep} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyku Başlangıcı *</label>
                  <input
                    type="datetime-local"
                    value={sleepForm.sleep_start}
                    onChange={e => setSleepForm({...sleepForm, sleep_start: e.target.value})}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyanma Zamanı *</label>
                  <input
                    type="datetime-local"
                    value={sleepForm.sleep_end}
                    onChange={e => setSleepForm({...sleepForm, sleep_end: e.target.value})}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyku Kalitesi: {sleepForm.quality}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sleepForm.quality}
                    onChange={e => setSleepForm({...sleepForm, quality: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Kötü</span>
                    <span>Mükemmel</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notlar</label>
                  <textarea
                    value={sleepForm.notes}
                    onChange={e => setSleepForm({...sleepForm, notes: e.target.value})}
                    className="input-dark resize-none"
                    rows={2}
                    placeholder="Örn: Gece uyanmadım, rahat uyudum"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddSleep(false)}
                    className="flex-1 btn-secondary"
                  >
                    İptal
                  </button>
                  <button type="submit" className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-6 rounded-xl transition">
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Messages Page
const MessagesPage = ({ user, setPage }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await api.getConversations(user.uid);
      setConversations(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const data = await api.getMessages(conv.id);
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgText = newMessage;
    setNewMessage('');

    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: user.uid,
      sender_name: user.displayName,
      sender_photo: user.photoURL,
      content: msgText,
      created_at: new Date().toISOString()
    };
    setMessages([...messages, tempMsg]);

    try {
      await api.sendMessage({
        conversation_id: activeConversation.id,
        sender_id: user.uid,
        sender_name: user.displayName,
        sender_photo: user.photoURL,
        content: msgText
      });
      loadConversations();
    } catch (e) {
      console.error(e);
    }
  };

  const getOtherParticipant = (conv) => {
    const idx = conv.participants.findIndex(p => p !== user.uid);
    return {
      name: conv.participant_names[idx] || 'Kullanıcı',
      photo: conv.participant_photos[idx] || ''
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pb-20 md:pb-0 md:pt-20">
        <div className="text-center">
          <MessageCircle size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Mesajlaşmak için giriş yap</p>
          <button
            onClick={() => setPage('login')}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20" data-testid="messages-page">
      <div className="max-w-4xl mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] flex">
        {/* Conversations List */}
        <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-gray-800 bg-gray-900/50`}>
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Mesajlar</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition border-b border-gray-800/50 ${
                      activeConversation?.id === conv.id ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    <img 
                      src={other.photo || 'https://via.placeholder.com/48'} 
                      alt="" 
                      className="w-12 h-12 rounded-full border-2 border-gray-700"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-white">{other.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{conv.last_message || 'Henüz mesaj yok'}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Henüz sohbet yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-black">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <img 
                src={getOtherParticipant(activeConversation).photo || 'https://via.placeholder.com/40'} 
                alt="" 
                className="w-10 h-10 rounded-full border-2 border-gray-700"
              />
              <h3 className="font-bold text-white">{getOtherParticipant(activeConversation).name}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === user.uid;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      isMe ? 'message-bubble-sent' : 'message-bubble-received'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesaj yaz..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-full transition disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-900/30">
            <div className="text-center text-gray-500">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p>Sohbet seç veya yeni bir sohbet başlat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Home Page
const HomePage = ({ user, setPage, onLogout }) => {
  const features = [
    { id: 'social', icon: Users, title: 'Sosyal Ağ', desc: 'Sporcularla bağlan, paylaş', color: 'yellow', page: 'social' },
    { id: 'tracker', icon: Activity, title: 'Egzersiz Takibi', desc: 'Koşu, uyku, kalori takibi', color: 'green', page: 'tracker' },
    { id: 'messages', icon: MessageCircle, title: 'Mesajlaşma', desc: 'Sporcularla sohbet et', color: 'blue', page: 'messages' },
    { id: 'nutrition', icon: Flame, title: 'Beslenme', desc: 'AI destekli kalori takibi', color: 'orange', page: 'nutrition' },
    { id: 'yoga', icon: Sparkles, title: 'Yoga & Meditasyon', desc: 'Zihin ve beden sağlığı', color: 'teal', page: 'yoga' },
    { id: 'analysis', icon: BrainCircuit, title: 'AI Analiz', desc: 'Maç tahminleri', color: 'purple', page: 'analysis' },
  ];

  const colorClasses = {
    yellow: 'border-yellow-500/20 hover:border-yellow-500/50 text-yellow-500',
    green: 'border-green-500/20 hover:border-green-500/50 text-green-500',
    blue: 'border-blue-500/20 hover:border-blue-500/50 text-blue-500',
    orange: 'border-orange-500/20 hover:border-orange-500/50 text-orange-500',
    teal: 'border-teal-500/20 hover:border-teal-500/50 text-teal-500',
    purple: 'border-purple-500/20 hover:border-purple-500/50 text-purple-500',
  };

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
        
        {/* Mobile User Menu */}
        <div className="md:hidden absolute top-4 right-4 z-20">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage('profile')}
                className="p-1 rounded-full border-2 border-yellow-500"
              >
                <img 
                  src={user.photoURL || 'https://via.placeholder.com/32'} 
                  alt="" 
                  className="w-8 h-8 rounded-full"
                />
              </button>
              <button
                onClick={onLogout}
                className="p-2 bg-gray-800/80 rounded-full text-gray-400"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPage('login')}
              className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold"
            >
              Giriş
            </button>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-black font-montserrat text-center mb-6"
          >
            SINIRLARINI<br />
            <span className="gradient-text">YENİDEN ÇİZ.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-10"
          >
            AI analizleri, sosyal bağlantılar, egzersiz takibi ve canlı tribün heyecanı tek bir platformda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => setPage('social')}
              data-testid="explore-btn"
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Users size={20} />
              Keşfet
            </button>
            <button 
              onClick={() => setPage('tracker')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Activity size={20} />
              Takibe Başla
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Tüm <span className="text-yellow-500">Özellikler</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setPage(feature.page)}
                className={`bg-gray-900/50 p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] ${colorClasses[feature.color]}`}
              >
                <feature.icon size={40} className="mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin, setPage }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md text-center"
      >
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldin</h1>
        <p className="text-gray-400 mb-8">Spor Ötesi'ne katılmak için giriş yap</p>
        
        <button 
          onClick={onLogin}
          data-testid="google-login-btn"
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.64 2 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.19 0 9.49-3.73 9.49-10c0-1.09-.1-1.88-.1-1.88z"/>
          </svg>
          Google ile Devam Et
        </button>

        <button
          onClick={() => setPage('home')}
          className="mt-6 text-gray-500 hover:text-gray-300 transition text-sm"
        >
          ← Ana Sayfaya Dön
        </button>
      </motion.div>
    </div>
  );
};

// Profile Page
const ProfilePage = ({ user, setPage }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let profileData = await api.getUser(user.uid);
      
      if (!profileData) {
        profileData = await api.createUser({
          firebase_uid: user.uid,
          display_name: user.displayName,
          email: user.email,
          photo_url: user.photoURL,
          bio: ''
        });
      }
      
      setProfile(profileData);
      setBio(profileData.bio || '');

      const [postsData, followersData, followingData] = await Promise.all([
        api.getUserPosts(user.uid),
        api.getFollowers(user.uid),
        api.getFollowing(user.uid)
      ]);

      setPosts(postsData);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateBio = async () => {
    try {
      await api.updateUser(user.uid, { bio });
      setProfile({ ...profile, bio });
      setEditMode(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <button
          onClick={() => setPage('login')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <img 
            src={user.photoURL || 'https://via.placeholder.com/120'} 
            alt="" 
            className="w-24 h-24 rounded-full border-4 border-yellow-500 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
          
          {editMode ? (
            <div className="mt-4 space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Kendini tanıt..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 resize-none outline-none focus:border-yellow-500"
                rows={2}
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleUpdateBio}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold transition"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => { setEditMode(false); setBio(profile?.bio || ''); }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-gray-400">{profile?.bio || 'Henüz bio eklenmemiş'}</p>
              <button
                onClick={() => setEditMode(true)}
                className="mt-2 text-yellow-500 text-sm hover:underline"
              >
                Düzenle
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{posts.length}</p>
              <p className="text-sm text-gray-400">Gönderi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{followers.length}</p>
              <p className="text-sm text-gray-400">Takipçi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{following.length}</p>
              <p className="text-sm text-gray-400">Takip</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          {['posts', 'followers', 'following'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center font-medium transition ${
                activeTab === tab 
                  ? 'text-yellow-500 border-b-2 border-yellow-500' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'posts' ? 'Gönderiler' : tab === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} user={user} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">Henüz gönderi yok</p>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-3">
            {followers.length > 0 ? (
              followers.map(f => (
                <UserCard key={f.id} profile={f} currentUser={user} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">Henüz takipçi yok</p>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-3">
            {following.length > 0 ? (
              following.map(f => (
                <UserCard key={f.id} profile={f} currentUser={user} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">Henüz kimseyi takip etmiyorsun</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Nutrition Page (from original code)
const NutritionPage = ({ setPage }) => {
  const [activeTab, setActiveTab] = useState("hesapla");
  const [val, setVal] = useState({ kilo: "", boy: "", yas: "", cinsiyet: "erkek", aktivite: "1.2" });
  const [bmrResult, setBmrResult] = useState(null);
  const [mealInput, setMealInput] = useState("");
  const [mealAnalysis, setMealAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const hesaplaBMR = (e) => {
    e.preventDefault();
    let bmr = 0;
    if (val.cinsiyet === "erkek") {
      bmr = (10 * Number(val.kilo)) + (6.25 * Number(val.boy)) - (5 * Number(val.yas)) + 5;
    } else {
      bmr = (10 * Number(val.kilo)) + (6.25 * Number(val.boy)) - (5 * Number(val.yas)) - 161;
    }
    const total = Math.round(bmr * Number(val.aktivite));
    setBmrResult(total);
  };

  const analizEt = async (e) => {
    e.preventDefault();
    if (!mealInput) return;
    setLoading(true);
    try {
      const prompt = `Bir diyetisyen gibi davran. Şu öğünü analiz et: "${mealInput}". 
      Şu formatta yanıt ver:
      1. Toplam Kalori: [Sayı] kcal
      2. Makro Besinler: Protein: [g], Karbonhidrat: [g], Yağ: [g]
      3. Kısa ve net bir sağlık yorumu (1 cümle).
      Türkçe yaz.`;
      
      const res = await askGemini(prompt);
      setMealAnalysis(res || "Hata");
    } catch (e) { 
      setMealAnalysis("Analiz yapılamadı, lütfen tekrar deneyin."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20 p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ChevronLeft size={20} /> Ana Sayfa
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-orange-500 mb-4 flex justify-center items-center gap-3">
            <Flame size={40}/> AI Beslenme Uzmanı
          </h1>
          <p className="text-gray-400">Günlük ihtiyacını hesapla veya yediğin yemeği analiz et.</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("hesapla")}
            className={`px-6 py-3 rounded-full font-bold transition ${activeTab === "hesapla" ? "bg-orange-500 text-black" : "bg-gray-800 text-gray-400"}`}
          >
            İhtiyaç Hesapla
          </button>
          <button 
            onClick={() => setActiveTab("analiz")}
            className={`px-6 py-3 rounded-full font-bold transition flex items-center gap-2 ${activeTab === "analiz" ? "bg-orange-500 text-black" : "bg-gray-800 text-gray-400"}`}
          >
            <Utensils size={18}/> Yediğimi Analiz Et
          </button>
        </div>

        <div className="bg-gray-900/90 p-8 rounded-3xl border border-orange-500/20">
          {activeTab === "hesapla" ? (
            <form onSubmit={hesaplaBMR} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">Kilo (kg)</label><input type="number" value={val.kilo} onChange={e=>setVal({...val, kilo:e.target.value})} className="input-dark" required/></div>
                <div><label className="block text-sm text-gray-400 mb-2">Boy (cm)</label><input type="number" value={val.boy} onChange={e=>setVal({...val, boy:e.target.value})} className="input-dark" required/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">Yaş</label><input type="number" value={val.yas} onChange={e=>setVal({...val, yas:e.target.value})} className="input-dark" required/></div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cinsiyet</label>
                  <select value={val.cinsiyet} onChange={e=>setVal({...val, cinsiyet:e.target.value})} className="input-dark">
                    <option value="erkek">Erkek</option>
                    <option value="kadin">Kadın</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Aktivite Seviyesi</label>
                <select value={val.aktivite} onChange={e=>setVal({...val, aktivite:e.target.value})} className="input-dark">
                  <option value="1.2">Hareketsiz (Masa başı)</option>
                  <option value="1.375">Az Hareketli (Haftada 1-3 gün spor)</option>
                  <option value="1.55">Orta Hareketli (Haftada 3-5 gün spor)</option>
                  <option value="1.725">Çok Hareketli (Haftada 6-7 gün spor)</option>
                </select>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-4 rounded-xl transition">HESAPLA</button>
              
              {bmrResult && (
                <div className="mt-6 text-center bg-gray-800 p-6 rounded-xl border border-orange-500/30">
                  <p className="text-gray-400 mb-2">Günlük Kalori İhtiyacın</p>
                  <p className="text-4xl font-black text-orange-500">{bmrResult} <span className="text-lg text-white">kcal</span></p>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              <textarea 
                value={mealInput}
                onChange={(e) => setMealInput(e.target.value)}
                placeholder="Örn: Sabah 2 yumurta, 5 zeytin, 1 dilim peynir ve domates yedim."
                className="w-full h-32 input-dark resize-none"
              ></textarea>
              <button onClick={analizEt} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-4 rounded-xl transition disabled:opacity-50 flex justify-center gap-2">
                {loading ? "Hesaplanıyor..." : <><ChefHat size={20}/> Kalorileri Hesapla</>}
              </button>
              {mealAnalysis && (
                <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-orange-500/30 prose prose-invert max-w-none whitespace-pre-line text-gray-300">
                  {mealAnalysis}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Yoga Page
const YogaPage = ({ setPage }) => {
  const [hedef, setHedef] = useState("stres_azaltma");
  const [sure, setSure] = useState("15");
  const [program, setProgram] = useState("");
  const [loading, setLoading] = useState(false);

  const programOlustur = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prompt = `Bir yoga eğitmeni gibi davran. Hedefim: ${hedef}. Süre: ${sure} dakika. Bana uygun, adım adım bir yoga veya meditasyon akışı hazırla. Başlangıç seviyesine uygun olsun. Türkçe yaz.`;
      const res = await askGemini(prompt);
      setProgram(res || "Hata oluştu.");
    } catch (e) { 
      setProgram("Hata oluştu: " + e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ChevronLeft size={20} /> Ana Sayfa
        </button>

        <div className="bg-gray-900/90 p-8 rounded-2xl border border-teal-500/30">
          <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center flex gap-2 justify-center items-center">
            <Sparkles/> AI Yoga & Meditasyon
          </h1>
          <form onSubmit={programOlustur} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Hedefiniz Nedir?</label>
              <select value={hedef} onChange={e=>setHedef(e.target.value)} className="input-dark">
                <option value="stres_azaltma">Stres Azaltma & Rahatlama</option>
                <option value="esneklik">Esneklik Kazanma</option>
                <option value="odaklanma">Zihin Netliği & Odaklanma</option>
                <option value="uyku">Daha İyi Uyku</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Süre (Dakika)</label>
              <select value={sure} onChange={e=>setSure(e.target.value)} className="input-dark">
                <option value="10">10 Dakika (Kısa)</option>
                <option value="15">15 Dakika (Orta)</option>
                <option value="30">30 Dakika (Uzun)</option>
              </select>
            </div>
            <button disabled={loading} className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-4 rounded-xl transition disabled:opacity-50">
              {loading ? "Akış Hazırlanıyor..." : "Huzurlu Akışı Başlat"}
            </button>
          </form>
          {program && <div className="mt-8 p-6 bg-black/50 rounded-xl border border-teal-500/20 prose prose-invert max-w-none whitespace-pre-line text-gray-300">{program}</div>}
        </div>
      </div>
    </div>
  );
};

// Analysis Page
const AnalysisPage = ({ setPage }) => {
  const [takim1, setTakim1] = useState("");
  const [takim2, setTakim2] = useState("");
  const [analiz, setAnaliz] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if(!takim1 || !takim2) return;
    setLoading(true); 
    setAnaliz("");

    try {
      const prompt = `Futbol analisti gibi davran. ${takim1} ve ${takim2} maçı için taktiksel analiz, güçlü/zayıf yönler ve skor tahmini yap. Türkçe yaz.`;
      const text = await askGemini(prompt);
      setAnaliz(text || "Hata");
    } catch (error) {
      setAnaliz(`⚠️ Hata: ${error.message}`);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0 md:pt-20 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ChevronLeft size={20} /> Ana Sayfa
        </button>

        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/50 mb-4 border border-purple-500/30">
              <Sparkles size={32} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Maç Analisti</h1>
          </div>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={takim1} onChange={e=>setTakim1(e.target.value)} placeholder="Ev Sahibi" className="input-dark" required />
              <input type="text" value={takim2} onChange={e=>setTakim2(e.target.value)} placeholder="Deplasman" className="input-dark" required />
            </div>
            <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex justify-center gap-2">
              {loading ? 'Analiz Ediliyor...' : <><BrainCircuit/> Analiz Et</>}
            </button>
          </form>
          {analiz && <div className="mt-8 p-6 bg-gray-900/80 rounded-xl border border-purple-500/30 prose prose-invert max-w-none whitespace-pre-line text-gray-300">{analiz}</div>}
        </div>
      </div>
    </div>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800 py-8 hidden md:block">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h3 className="text-2xl font-bold font-montserrat text-yellow-500 mb-4">SPOR ÖTESİ</h3>
      <p className="text-gray-500 text-sm">© 2025 Yapay zeka destekli vizyoner spor platformu.</p>
    </div>
  </footer>
);

// --- MAIN APP ---
function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        setLoading(false);
        
        // Create/update user profile on login
        if (u) {
          try {
            await api.createUser({
              firebase_uid: u.uid,
              display_name: u.displayName,
              email: u.email,
              photo_url: u.photoURL,
              bio: ''
            });
          } catch (e) {
            console.error('User sync error:', e);
          }
        }
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    if (auth) {
      try { 
        await signInWithPopup(auth, googleProvider); 
        setPage('home'); 
      } catch(e) { 
        console.error(e); 
      }
    }
  };

  const handleLogout = async () => {
    if (auth) { 
      await signOut(auth); 
      setPage('home'); 
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage user={user} setPage={setPage} onLogout={handleLogout} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} setPage={setPage} />;
      case 'social':
        return <SocialPage user={user} setPage={setPage} setViewUserId={setViewUserId} />;
      case 'tracker':
        return <TrackerPage user={user} setPage={setPage} />;
      case 'messages':
        return <MessagesPage user={user} setPage={setPage} />;
      case 'profile':
        return <ProfilePage user={user} setPage={setPage} />;
      case 'nutrition':
        return <NutritionPage setPage={setPage} />;
      case 'yoga':
        return <YogaPage setPage={setPage} />;
      case 'analysis':
        return <AnalysisPage setPage={setPage} />;
      default:
        return <HomePage user={user} setPage={setPage} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-black text-white min-h-screen">
      <NavBar user={user} setPage={setPage} currentPage={page} onLogout={handleLogout} />
      <main>
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
