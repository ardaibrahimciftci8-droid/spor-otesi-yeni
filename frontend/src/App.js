import React, { useState, useEffect, useRef } from 'react';
import { 
  User, ArrowRight, X, Activity, Flame, MessageCircle, PlusCircle, LogOut, BrainCircuit, 
  Sparkles, Dumbbell, Utensils, ChefHat, Heart, Wallet, Search, MapPin, Send, Video, 
  Image, Users, Home, Footprints, Timer, Zap, TrendingUp, Moon as MoonIcon, ChevronLeft,
  Trash2, Share, MessageSquare, Trophy, Target, Gift, Megaphone, Star, Crown, Rocket,
  Globe, Award, Coffee, ShoppingBag, Smartphone, Headphones, Volume2, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

// Import utilities and API
import { TURKEY_CITIES, ACTIVITY_TYPES, ADS, firebaseConfig } from './utils/constants';
import { askGemini } from './utils/helpers';
import api from './api';

// Import components
import AdBanner from './components/common/AdBanner';
import AICoach from './components/common/AICoach';

// Firebase initialization
let app, auth, googleProvider;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase error:", e);
}

// AdBanner component moved to /components/common/AdBanner.js
// AICoach component moved to /components/common/AICoach.js

// --- NAVIGATION ---
const NavBar = ({ user, setPage, currentPage, onLogout }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Ana Sayfa' },
    { id: 'social', icon: Users, label: 'Sosyal' },
    { id: 'tracker', icon: Activity, label: 'Takip' },
    { id: 'yoga', icon: Sparkles, label: 'Yoga' },
    { id: 'donate', icon: Heart, label: 'Bağış' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="hidden md:flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
            <img src="/logo.png" alt="Spor Ötesi Logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">SPOR ÖTESİ</span>
          </div>

          <div className="flex items-center justify-around w-full md:w-auto md:gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium hidden md:block">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setPage('analytics')} className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-xl transition relative">
                  <TrendingUp size={20} />
                </button>
                <button onClick={() => setPage('notifications')} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition relative">
                  <MessageCircle size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                </button>
                <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setPage('login')} className="btn-primary text-sm">Giriş Yap</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- POST CARD ---
const PostCard = ({ post, user, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="post-card">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl border-2 border-white/10" />
          <div>
            <h4 className="font-bold text-white">{post.user_name}</h4>
            <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
          </div>
        </div>
        {user?.uid === post.user_id && (
          <button onClick={() => onDelete && onDelete(post.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-lg transition">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="px-4 pb-3">
        <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.media_url && (
        <div className="relative">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls className="w-full max-h-[500px] object-cover" />
          ) : (
            <img src={post.media_url} alt="" className="w-full max-h-[500px] object-cover" />
          )}
        </div>
      )}

      <div className="p-4 flex items-center gap-6 border-t border-white/5">
        <button onClick={handleLike} className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>
        <button onClick={handleShowComments} className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition">
          <MessageSquare size={22} />
          <span className="text-sm font-medium">{post.comments_count || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
          <Share size={22} />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 overflow-hidden">
            <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=32'} alt="" className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 bg-white/5 rounded-xl p-3">
                    <span className="font-medium text-sm text-yellow-500">{comment.user_name}</span>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-gray-500 text-sm">Henüz yorum yok</p>}
            </div>
            {user && (
              <form onSubmit={handleSubmitComment} className="p-4 pt-0 flex gap-2">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Yorum yaz..." className="flex-1 input-modern py-2 text-sm" />
                <button type="submit" disabled={!newComment.trim()} className="btn-primary py-2 px-4 disabled:opacity-50">
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

// --- CREATE POST MODAL ---
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
        const res = mediaType === 'video' ? await api.uploadVideo(media) : await api.uploadImage(media);
        mediaUrl = res.url;
      }
      const post = await api.createPost({
        user_id: user.uid, user_name: user.displayName, user_photo: user.photoURL,
        content, media_url: mediaUrl, media_type: mediaType
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-card w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Yeni Gönderi</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <img src={user?.photoURL || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Ne düşünüyorsun?" className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg" rows={4} />
          </div>
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden bg-white/5">
              {mediaType === 'video' ? <video src={mediaPreview} controls className="w-full max-h-64 object-cover" /> : <img src={mediaPreview} alt="" className="w-full max-h-64 object-cover" />}
              <button type="button" onClick={() => { setMedia(null); setMediaPreview(null); setMediaType(null); }} className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black"><X size={16} /></button>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition"><Image size={22} /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"><Video size={22} /></button>
            </div>
            <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary disabled:opacity-50">{loading ? 'Paylaşılıyor...' : 'Paylaş'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- USER CARD ---
const UserCard = ({ profile, currentUser, onViewProfile }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && profile.firebase_uid !== currentUser.uid) {
      api.checkFollowing(profile.firebase_uid, currentUser.uid).then(res => setIsFollowing(res.is_following)).catch(() => {});
    }
  }, [profile.firebase_uid, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (isFollowing) await api.unfollowUser(profile.firebase_uid, currentUser.uid);
      else await api.followUser(profile.firebase_uid, currentUser.uid);
      setIsFollowing(!isFollowing);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onViewProfile}>
        <img src={profile.photo_url || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl border-2 border-white/10" />
        <div>
          <h4 className="font-bold text-white">{profile.display_name}</h4>
          <p className="text-sm text-gray-400">{profile.followers_count || 0} takipçi</p>
        </div>
      </div>
      {currentUser && profile.firebase_uid !== currentUser.uid && (
        <button onClick={handleFollow} disabled={loading} className={`px-4 py-2 rounded-xl font-medium transition ${isFollowing ? 'bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-500 border border-white/10' : 'btn-primary'}`}>
          {loading ? '...' : (isFollowing ? 'Takipten Çık' : 'Takip Et')}
        </button>
      )}
    </div>
  );
};

// --- HOME PAGE ---
const HomePage = ({ user, setPage, onLogout }) => {
  const features = [
    { id: 'social', icon: Users, title: 'Sosyal Ağ', desc: 'Sporcularla bağlan, ilham al', color: '#f59e0b', page: 'social' },
    { id: 'tracker', icon: Activity, title: 'Egzersiz Takibi', desc: 'AI destekli antrenman takibi', color: '#10b981', page: 'tracker' },
    { id: 'donate', icon: Heart, title: 'Bağış Yap', desc: '81 ile spor desteği', color: '#ef4444', page: 'donate' },
    { id: 'messages', icon: MessageCircle, title: 'Mesajlaşma', desc: 'Sporcularla sohbet et', color: '#3b82f6', page: 'messages' },
    { id: 'nutrition', icon: Flame, title: 'Beslenme', desc: 'AI kalori hesaplama', color: '#f97316', page: 'nutrition' },
    { id: 'analysis', icon: BrainCircuit, title: 'AI Analiz', desc: 'Akıllı maç tahminleri', color: '#8b5cf6', page: 'analysis' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-28">
      <div className="animated-bg" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-36 md:pb-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Mobile User Menu */}
          <div className="md:hidden fixed top-20 right-4 z-50">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
                <button onClick={() => setPage('profile')} className="p-1">
                  <img src={user.photoURL || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=32'} alt="" className="w-10 h-10 rounded-xl border-2 border-yellow-500/50" />
                </button>
                <button onClick={onLogout} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-red-500 transition"><LogOut size={18} /></button>
              </div>
            ) : (
              <button onClick={() => setPage('login')} className="btn-primary text-sm py-2 px-4 shadow-lg">Giriş</button>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full px-6 py-3 mb-6 backdrop-blur-xl">
              <Rocket size={20} className="text-yellow-500 animate-pulse" />
              <span className="text-sm font-semibold text-yellow-500">Yapay Zeka Destekli Platform</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            SINIRLARINI<br />
            <span className="gradient-text">YENİDEN ÇİZ</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI analizleri, sosyal bağlantılar, egzersiz takibi ve topluma katkı - hepsi tek platformda.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setPage('social')} className="btn-primary flex items-center justify-center gap-3 text-lg px-8 py-4 shadow-2xl">
              <Users size={24} />Keşfet
            </button>
            <button onClick={() => setPage('donate')} className="btn-secondary flex items-center justify-center gap-3 text-lg px-8 py-4 shadow-2xl">
              <Heart size={24} />Bağış Yap
            </button>
          </motion.div>
        </div>

        {/* Floating Element - Right */}
        <div className="hidden lg:block absolute bottom-20 right-10 hero-float" style={{ animationDelay: '2s' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
            <Target size={32} className="text-blue-500" />
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <AdBanner />
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl md:text-4xl font-bold text-center mb-12">
          Tüm <span className="gradient-text">Özellikler</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.button key={feature.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} onClick={() => setPage(feature.page)} className="feature-card text-left group" style={{ '--card-accent': feature.color }}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`} style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)` }}>
                <feature.icon size={28} style={{ color: feature.color }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
              <ArrowRight size={20} className="text-gray-600 mt-4 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="glass-card p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Aktif Sporcu', icon: Users },
              { value: '81', label: 'İl Desteği', icon: MapPin },
              { value: '50K+', label: 'Paylaşım', icon: MessageCircle },
              { value: '1M+', label: 'Toplam Bağış', icon: Heart },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <stat.icon size={32} className="mx-auto mb-3 text-yellow-500" />
                <div className="text-3xl md:text-4xl font-black gradient-text">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- DONATION PAGE ---
const DonatePage = ({ user, setPage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [amount, setAmount] = useState('');
  const [donationComplete, setDonationComplete] = useState(false);

  const filteredCities = TURKEY_CITIES.filter(city => city.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDonate = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Bağış yapmak için giriş yapmalısınız');
      setPage('login');
      return;
    }
    if (!amount || parseInt(amount) < 1) {
      alert('Lütfen geçerli bir miktar girin');
      return;
    }
    setDonationComplete(true);
    setTimeout(() => {
      setDonationComplete(false);
      setSelectedCity(null);
      setAmount('');
    }, 3000);
  };

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6">
            <Heart size={16} className="text-red-500" />
            <span className="text-sm text-red-400">Topluma Katkı</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Spor Geleceğimize <span className="gradient-text">Destek Ol</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Türkiye&apos;nin 81 ilindeki genç sporculara umut ol. Seçtiğin ile yapacağın her bağış, geleceğin şampiyonlarına destek oluyor.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="text" placeholder="İl ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-modern pl-12" />
          </div>
        </motion.div>

        {/* Cities Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-8 max-h-[400px] overflow-y-auto p-2">
          {filteredCities.map((city, idx) => (
            <motion.button key={city} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.01 }} onClick={() => setSelectedCity(city)} className="city-card">
              <MapPin size={20} className="mx-auto mb-2 text-red-500" />
              <span className="text-sm font-medium text-white">{city}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner />
        </div>

        {/* Donation Modal */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card p-8 w-full max-w-md relative">
                <button onClick={() => setSelectedCity(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                  <X size={24} />
                </button>

                {!donationComplete ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 glow-red">
                        <Heart size={40} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{selectedCity}</h2>
                      <p className="text-gray-400 text-sm">Spor Altyapı Fonu</p>
                    </div>

                    <form onSubmit={handleDonate} className="space-y-6">
                      <div className="grid grid-cols-3 gap-2">
                        {presetAmounts.map(preset => (
                          <button key={preset} type="button" onClick={() => setAmount(preset.toString())} className={`py-3 rounded-xl font-bold transition ${amount === preset.toString() ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'}`}>
                            {preset}₺
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Özel Miktar</label>
                        <div className="relative">
                          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-modern pl-12 text-lg font-bold" placeholder="0" min="1" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] glow-red">
                        Bağışı Tamamla
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award size={48} className="text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Teşekkürler!</h2>
                    <p className="text-gray-400">{selectedCity} için {amount}₺ bağışınız alındı</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- NOTIFICATIONS PAGE ---
const NotificationsPage = ({ user, setPage }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(user.uid);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <MessageCircle size={64} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Bildirimlerinizi görmek için giriş yapın</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Bildirimler</h1>
          </div>
          <p className="text-gray-400">Tüm bildirimlerinizi burada görün</p>
        </motion.div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
                className={`glass-card p-4 cursor-pointer transition ${
                  notification.read ? 'opacity-60' : 'border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ${!notification.read && 'glow-blue'}`}>
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{notification.title}</h4>
                    <p className="text-sm text-gray-400">{notification.body}</p>
                    <span className="text-xs text-gray-600 mt-2 block">
                      {new Date(notification.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 glass-card">
              <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">Henüz bildirim yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- GOALS PAGE ---
const GoalsPage = ({ user, setPage }) => {
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [goalForm, setGoalForm] = useState({
    type: 'fitness',
    title: '',
    description: '',
    target: '',
    unit: 'count'
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, achievementsData, reportsData] = await Promise.all([
        api.getUserGoals(user.uid),
        api.getUserAchievements(user.uid),
        api.getUserReports(user.uid, 5)
      ]);
      setGoals(goalsData);
      setAchievements(achievementsData);
      setReports(reportsData);
      
      // Check for new achievements
      await api.checkAchievements(user.uid);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const newGoal = await api.createGoal(
        user.uid,
        goalForm.type,
        goalForm.title,
        goalForm.description,
        parseFloat(goalForm.target) || null,
        goalForm.unit
      );
      setGoals([newGoal, ...goals]);
      setShowCreateGoal(false);
      setGoalForm({ type: 'fitness', title: '', description: '', target: '', unit: 'count' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      const report = await api.generateProgressReport(user.uid, type);
      setReports([report, ...reports]);
      setShowReports(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <Target size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Hedeflerini görmek için giriş yap</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target size={32} className="text-green-500" />
            <h1 className="text-3xl font-bold text-white">Hedeflerim & Başarılar</h1>
          </div>
          <p className="text-gray-400">İlerlemeni takip et ve rozetlerini topla</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Goals & Reports */}
            <div className="md:col-span-2 space-y-6">
              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setShowCreateGoal(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <PlusCircle size={20} />
                  Yeni Hedef
                </button>
                <button onClick={() => handleGenerateReport('weekly')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2">
                  <TrendingUp size={20} />
                  Rapor Oluştur
                </button>
              </div>

              {/* Goals */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Aktif Hedefler</h2>
                <div className="space-y-3">
                  {goals.filter(g => g.status === 'active').length > 0 ? (
                    goals.filter(g => g.status === 'active').map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                            <p className="text-sm text-gray-400">{goal.description}</p>
                          </div>
                          <span className="text-xs px-3 py-1 bg-green-500/20 text-green-500 rounded-full">
                            {goal.goal_type}
                          </span>
                        </div>
                        {goal.target_value && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-400">İlerleme</span>
                              <span className="text-white font-bold">
                                {goal.current_value} / {goal.target_value} {goal.unit}
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 glass-card">
                      <Target size={48} className="mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-500">Henüz aktif hedef yok</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reports */}
              {reports.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Son Raporlar</h2>
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp size={20} className="text-purple-500" />
                          <h3 className="font-bold text-white capitalize">{report.report_type} Rapor</h3>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(report.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">{report.summary}</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-500">{report.activities_count}</p>
                            <p className="text-xs text-gray-500">Aktivite</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-teal-500">{report.yoga_sessions}</p>
                            <p className="text-xs text-gray-500">Yoga</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-500">{report.coach_interactions}</p>
                            <p className="text-xs text-gray-500">AI Koç</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Achievements */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Rozetler</h2>
              <div className="glass-card p-6">
                {achievements.length > 0 ? (
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                      >
                        <span className="text-4xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{achievement.title}</h4>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500">Henüz rozet yok. Aktivite yap ve rozetlerini kazan!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-8 w-full max-w-md relative"
            >
              <button onClick={() => setShowCreateGoal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Yeni Hedef Oluştur</h2>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hedef Türü</label>
                  <select value={goalForm.type} onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value })} className="input-modern">
                    <option value="fitness">Fitness</option>
                    <option value="yoga">Yoga</option>
                    <option value="nutrition">Beslenme</option>
                    <option value="weight">Kilo</option>
                    <option value="sleep">Uyku</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    placeholder="Örn: 5 km koş"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Açıklama</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    placeholder="Detaylar..."
                    className="input-modern resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Hedef</label>
                    <input
                      type="number"
                      value={goalForm.target}
                      onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                      placeholder="10"
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Birim</label>
                    <select value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} className="input-modern">
                      <option value="count">Adet</option>
                      <option value="km">Kilometre</option>
                      <option value="kg">Kilogram</option>
                      <option value="hours">Saat</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all">
                  Hedef Oluştur
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ANALYTICS PAGE ---
const AnalyticsPage = ({ user, setPage }) => {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const generalStats = await api.getAnalyticsStats();
      setStats(generalStats);
      
      if (user) {
        const uStats = await api.getUserAnalytics(user.uid);
        setUserStats(uStats);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <TrendingUp size={64} className="mx-auto text-purple-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">İstatistiklerinizi görmek için giriş yapın</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={32} className="text-purple-500" />
            <h1 className="text-3xl font-bold text-white">İstatistikler</h1>
          </div>
          <p className="text-gray-400">Aktivitelerinizi ve ilerlemelerinizi takip edin</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Stats */}
            {userStats && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Senin İstatistiklerin</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare size={24} className="text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{userStats.posts_count}</h3>
                    <p className="text-sm text-gray-400">Post</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <Activity size={24} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{userStats.activities_count}</h3>
                    <p className="text-sm text-gray-400">Aktivite</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={24} className="text-teal-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{userStats.yoga_programs_count}</h3>
                    <p className="text-sm text-gray-400">Yoga Programı</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3">
                      <BrainCircuit size={24} className="text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{userStats.coach_chats_count}</h3>
                    <p className="text-sm text-gray-400">AI Koç Sohbeti</p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Global Stats */}
            {stats && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Genel İstatistikler</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={20} className="text-blue-500" />
                      <h4 className="font-bold text-white">Toplam Kullanıcı</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare size={20} className="text-orange-500" />
                      <h4 className="font-bold text-white">Toplam Post</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total_posts}</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity size={20} className="text-green-500" />
                      <h4 className="font-bold text-white">Toplam Aktivite</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total_activities}</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles size={20} className="text-teal-500" />
                      <h4 className="font-bold text-white">Yoga Programları</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total_yoga_programs}</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <BrainCircuit size={20} className="text-purple-500" />
                      <h4 className="font-bold text-white">AI Koç Mesajları</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total_coach_messages}</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap size={20} className="text-yellow-500" />
                      <h4 className="font-bold text-white">Son 7 Gün Event</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.recent_events_7d}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- SOCIAL PAGE ---
const SocialPage = ({ user, setPage }) => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'reels'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Reels state
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [showCreateReel, setShowCreateReel] = useState(false);
  
  // Messaging state
  const [showMessages, setShowMessages] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getFeed(user?.uid);
      setPosts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadConversations = async () => {
    if (!user) return;
    try {
      const data = await api.getConversations(user.uid);
      setConversations(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadPosts(); }, [user]);
  useEffect(() => { if (user && showMessages) loadConversations(); }, [user, showMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const results = await api.searchUsers(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deletePost(postId, user.uid);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) { console.error(e); }
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const data = await api.getMessages(conv.id);
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgText = newMessage;
    setNewMessage('');
    const tempMsg = { id: Date.now().toString(), sender_id: user.uid, sender_name: user.displayName, content: msgText, created_at: new Date().toISOString() };
    setMessages([...messages, tempMsg]);
    try {
      await api.sendMessage({ conversation_id: activeConversation.id, sender_id: user.uid, sender_name: user.displayName, sender_photo: user.photoURL, content: msgText });
      loadConversations();
    } catch (e) { console.error(e); }
  };

  const getOtherParticipant = (conv) => {
    const idx = conv.participants.findIndex(p => p !== user.uid);
    return { name: conv.participant_names[idx] || 'Kullanıcı', photo: conv.participant_photos[idx] || '' };
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-7xl mx-auto flex gap-4">
        {/* Main Content */}
        <div className={`flex-1 ${showMessages && activeConversation ? 'hidden md:block' : 'block'}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Sosyal</h1>
                <p className="text-gray-400">Sporcularla bağlan, paylaş, ilham ol</p>
              </div>
              {user && (
                <button onClick={() => setShowMessages(!showMessages)} className={`btn-primary flex items-center gap-2 ${showMessages ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}`}>
                  <MessageCircle size={20} />
                  <span className="hidden md:inline">{showMessages ? 'Mesajları Gizle' : 'Mesajlar'}</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Kullanıcı ara..." className="input-modern pl-12" />
            </div>
          </form>

          {/* Search Results */}
          {showSearch && searchResults.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Arama Sonuçları</h3>
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              {searchResults.map(profile => (
                <UserCard key={profile.id} profile={profile} currentUser={user} onViewProfile={() => setPage('profile')} />
              ))}
            </div>
          )}

          {/* Create Post */}
          {user && (
            <button onClick={() => setShowCreatePost(true)} className="w-full glass-card p-4 flex items-center gap-4 mb-6 hover:border-white/20 transition text-left">
              <img src={user.photoURL || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
              <span className="text-gray-500">Ne düşünüyorsun?</span>
            </button>
          )}

          {/* Ad Banner */}
          <div className="mb-6">
            <AdBanner />
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} user={user} onDelete={handleDeletePost} />
              ))
            ) : (
              <div className="text-center py-10 glass-card">
                <Users size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz paylaşım yok</p>
                {user && (
                  <button onClick={() => setShowCreatePost(true)} className="mt-4 btn-primary">İlk paylaşımı yap!</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages Sidebar */}
        {showMessages && user && (
          <div className={`${activeConversation ? 'fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden md:block'} w-full md:w-96 glass-card h-[calc(100vh-8rem)] md:sticky md:top-24`}>
            {!activeConversation ? (
              <>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Mesajlar</h2>
                  <button onClick={() => setShowMessages(false)} className="md:hidden text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                  {conversations.length > 0 ? conversations.map(conv => {
                    const other = getOtherParticipant(conv);
                    return (
                      <button key={conv.id} onClick={() => openConversation(conv)} className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition border-b border-white/5">
                        <img src={other.photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-white">{other.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{conv.last_message || 'Henüz mesaj yok'}</p>
                        </div>
                      </button>
                    );
                  }) : (
                    <div className="p-4 text-center text-gray-500">
                      <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Henüz sohbet yok</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-white/5 rounded-lg">
                    <ChevronLeft size={20} />
                  </button>
                  <img src={getOtherParticipant(activeConversation).photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'} alt="" className="w-10 h-10 rounded-xl" />
                  <h3 className="font-bold text-white">{getOtherParticipant(activeConversation).name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex ${msg.sender_id === user.uid ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 ${msg.sender_id === user.uid ? 'message-sent' : 'message-received'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 input-modern" />
                  <button type="submit" disabled={!newMessage.trim()} className="btn-primary px-4 disabled:opacity-50"><Send size={20} /></button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreatePost && user && <CreatePostModal user={user} onClose={() => setShowCreatePost(false)} onPostCreated={(p) => setPosts([p, ...posts])} />}
      </AnimatePresence>
    </div>
  );
};

// --- YOGA & MEDITATION PAGE ---
const YogaPage = ({ user, setPage }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [programForm, setProgramForm] = useState({
    name: '',
    duration: 30,
    difficulty: 'beginner',
    preferences: ''
  });
  const [generatingProgram, setGeneratingProgram] = useState(false);

  const loadPrograms = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUserYogaPrograms(user.uid);
      setPrograms(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadPrograms();
  }, [user]);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!user) return;
    setGeneratingProgram(true);
    try {
      const newProgram = await api.generateYogaProgram(
        user.uid,
        programForm.name,
        programForm.duration,
        programForm.difficulty,
        programForm.preferences
      );
      setPrograms([newProgram, ...programs]);
      setShowCreateProgram(false);
      setProgramForm({ name: '', duration: 30, difficulty: 'beginner', preferences: '' });
    } catch (e) {
      console.error(e);
    }
    setGeneratingProgram(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <Sparkles size={64} className="mx-auto text-teal-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Yoga ve meditasyon programlarına erişmek için giriş yap</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={32} className="text-teal-500" />
            <h1 className="text-3xl font-bold text-white">Yoga & Meditasyon</h1>
          </div>
          <p className="text-gray-400">AI destekli kişiselleştirilmiş yoga ve meditasyon programları</p>
        </motion.div>

        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="yoga"
            title="Yoga Koçu"
            icon={Sparkles}
            color="text-teal-500"
            placeholder="Yoga veya meditasyon hakkında soru sorun..."
          />
        </div>

        {/* Create Program Button */}
        <button
          onClick={() => setShowCreateProgram(true)}
          className="w-full glass-card p-6 mb-8 hover:border-white/20 transition text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
              <PlusCircle size={28} className="text-teal-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yeni Program Oluştur</h3>
              <p className="text-sm text-gray-400">AI ile kişiselleştirilmiş yoga programı</p>
            </div>
          </div>
          <ArrowRight size={24} className="text-gray-400" />
        </button>

        {/* Programs List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Programlarım</h2>
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : programs.length > 0 ? (
            programs.map((program) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{program.program_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Timer size={16} />
                        {program.duration_minutes} dk
                      </span>
                      <span className="capitalize">{program.difficulty === 'beginner' ? 'Başlangıç' : program.difficulty === 'intermediate' ? 'Orta' : 'İleri'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(program.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="text-gray-300 text-sm whitespace-pre-line">
                  {program.exercises[0]?.description?.substring(0, 200)}...
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 glass-card">
              <Sparkles size={48} className="mx-auto text-teal-500 opacity-50 mb-4" />
              <p className="text-gray-500">Henüz program yok</p>
              <button onClick={() => setShowCreateProgram(true)} className="mt-4 btn-primary">
                İlk Programını Oluştur
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Program Modal */}
      <AnimatePresence>
        {showCreateProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-8 w-full max-w-md relative"
            >
              <button
                onClick={() => setShowCreateProgram(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Yeni Program Oluştur</h2>

              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Program Adı</label>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                    placeholder="Örn: Sabah Rutini"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Süre (dakika)</label>
                  <select
                    value={programForm.duration}
                    onChange={(e) => setProgramForm({ ...programForm, duration: parseInt(e.target.value) })}
                    className="input-modern"
                  >
                    <option value={15}>15 dakika</option>
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Seviye</label>
                  <select
                    value={programForm.difficulty}
                    onChange={(e) => setProgramForm({ ...programForm, difficulty: e.target.value })}
                    className="input-modern"
                  >
                    <option value="beginner">Başlangıç</option>
                    <option value="intermediate">Orta</option>
                    <option value="advanced">İleri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tercihler (Opsiyonel)</label>
                  <textarea
                    value={programForm.preferences}
                    onChange={(e) => setProgramForm({ ...programForm, preferences: e.target.value })}
                    placeholder="Örn: Sırt ağrım var, esnekliğimi artırmak istiyorum..."
                    className="input-modern resize-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingProgram}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {generatingProgram ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Oluşturuluyor...
                    </span>
                  ) : (
                    'Program Oluştur'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- TRACKER PAGE ---
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
  const [activityForm, setActivityForm] = useState({ activity_type: 'running', duration_minutes: '', distance_km: '', calories_burned: '', notes: '' });
  const [sleepForm, setSleepForm] = useState({ sleep_start: '', sleep_end: '', quality: 3, notes: '' });
  const [syncingGoogleFit, setSyncingGoogleFit] = useState(false);

  const handleGoogleFitSync = async () => {
    setSyncingGoogleFit(true);
    try {
      // Load Google API script if not loaded
      if (!window.gapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Initialize Google Fit
      await new Promise((resolve) => {
        window.gapi.load('auth2', resolve);
      });

      const auth2 = await window.gapi.auth2.init({
        client_id: '513216468100-s4i9lqu1ovi8p2bpjcgbl81ts5n405ff.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read'
      });

      const googleUser = await auth2.signIn();
      const accessToken = googleUser.getAuthResponse().access_token;

      // Fetch last 7 days data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            aggregateBy: [{
              dataTypeName: 'com.google.step_count.delta'
            }, {
              dataTypeName: 'com.google.distance.delta'
            }, {
              dataTypeName: 'com.google.calories.expended'
            }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startDate.getTime(),
            endTimeMillis: endDate.getTime()
          })
        }
      );

      const data = await response.json();
      let activitiesAdded = 0;

      if (data.bucket) {
        for (const bucket of data.bucket) {
          let steps = 0, distance = 0, calories = 0;

          bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
              if (dataset.dataSourceId.includes('step_count')) {
                steps = point.value[0].intVal;
              } else if (dataset.dataSourceId.includes('distance')) {
                distance = (point.value[0].fpVal / 1000).toFixed(2);
              } else if (dataset.dataSourceId.includes('calories')) {
                calories = Math.round(point.value[0].fpVal);
              }
            });
          });

          if (steps > 1000) {
            const activityType = steps > 10000 ? 'running' : 'walking';
            await api.createActivity({
              user_id: user.uid,
              activity_type: activityType,
              duration_minutes: Math.round(steps / 100),
              distance_km: distance || null,
              calories_burned: calories || null,
              notes: 'Google Fit\'ten otomatik eklendi'
            });
            activitiesAdded++;
          }
        }
      }

      alert(`✅ ${activitiesAdded} aktivite Google Fit'ten başarıyla eklendi!`);
      loadData();
    } catch (error) {
      console.error('Google Fit sync error:', error);
      alert('❌ Google Fit senkronizasyonu başarısız. Lütfen tekrar deneyin.');
    }
    setSyncingGoogleFit(false);
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [activitiesData, sleepData, statsData, sleepStatsData] = await Promise.all([
        api.getActivities(user.uid), api.getSleepRecords(user.uid),
        api.getActivityStats(user.uid, 7), api.getSleepStats(user.uid, 7)
      ]);
      setActivities(activitiesData); setSleepRecords(sleepData);
      setStats(statsData); setSleepStats(sleepStatsData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.duration_minutes) return;
    try {
      const activity = await api.createActivity({
        user_id: user.uid, activity_type: activityForm.activity_type,
        duration_minutes: parseInt(activityForm.duration_minutes),
        distance_km: activityForm.distance_km ? parseFloat(activityForm.distance_km) : null,
        calories_burned: activityForm.calories_burned ? parseInt(activityForm.calories_burned) : null,
        notes: activityForm.notes || null
      });
      setActivities([activity, ...activities]);
      setShowAddActivity(false);
      setActivityForm({ activity_type: 'running', duration_minutes: '', distance_km: '', calories_burned: '', notes: '' });
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    if (!sleepForm.sleep_start || !sleepForm.sleep_end) return;
    try {
      const record = await api.createSleepRecord({
        user_id: user.uid, sleep_start: new Date(sleepForm.sleep_start).toISOString(),
        sleep_end: new Date(sleepForm.sleep_end).toISOString(), quality: sleepForm.quality, notes: sleepForm.notes || null
      });
      setSleepRecords([record, ...sleepRecords]);
      setShowAddSleep(false);
      setSleepForm({ sleep_start: '', sleep_end: '', quality: 3, notes: '' });
      loadData();
    } catch (e) { console.error(e); }
  };

  const getAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await api.analyzeActivity(user.uid);
      setAiAnalysis(res.analysis);
    } catch (e) {
      setAiAnalysis('Analiz yapılamadı.');
    }
    setAiLoading(false);
  };

  const getActivityIcon = (type) => ACTIVITY_TYPES.find(a => a.id === type) || ACTIVITY_TYPES[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <Activity size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Aktivitelerini takip etmek için giriş yap</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Egzersiz Takibi</h1>
          <p className="text-gray-400">AI destekli aktivite ve uyku takibi</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Footprints, value: stats.total_activities, label: 'Aktivite', color: 'text-green-500' },
              { icon: Timer, value: stats.total_duration_minutes, label: 'Dakika', color: 'text-blue-500' },
              { icon: TrendingUp, value: stats.total_distance_km, label: 'km', color: 'text-yellow-500' },
              { icon: Flame, value: stats.total_calories_burned, label: 'kcal', color: 'text-orange-500' },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="stats-card text-center">
                <stat.icon size={28} className={`mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="exercise"
            title="Egzersiz Koçu"
            icon={Dumbbell}
            color="text-purple-500"
            placeholder="Antrenman programı veya egzersiz tekniği hakkında soru sorun..."
          />
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner />
        </div>

        {/* Google Fit Sync Button */}
        <div className="mb-6">
          <button
            onClick={handleGoogleFitSync}
            disabled={syncingGoogleFit}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {syncingGoogleFit ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Google Fit'ten veriler alınıyor...
              </>
            ) : (
              <>
                <Smartphone size={20} />
                Google Fit'ten Aktiviteleri Al
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('activities')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'activities' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black' : 'bg-white/5 text-gray-400'}`}>
            <Activity size={20} className="inline mr-2" />Aktiviteler
          </button>
          <button onClick={() => setActiveTab('sleep')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'sleep' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
            <MoonIcon size={20} className="inline mr-2" />Uyku
          </button>
        </div>

        {/* Add Button */}
        <button onClick={() => activeTab === 'activities' ? setShowAddActivity(true) : setShowAddSleep(true)} className={`w-full py-4 rounded-xl font-bold transition mb-6 flex items-center justify-center gap-2 ${activeTab === 'activities' ? 'bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/30 hover:bg-purple-500/20'}`}>
          <PlusCircle size={20} />
          {activeTab === 'activities' ? 'Aktivite Ekle' : 'Uyku Kaydı Ekle'}
        </button>

        {/* Content */}
        {activeTab === 'activities' ? (
          <div className="space-y-4">
            {activities.length > 0 ? activities.map(activity => {
              const actType = getActivityIcon(activity.activity_type);
              return (
                <motion.div key={activity.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${actType.bg}`}>
                      <actType.icon size={24} className={actType.color} />
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
                </motion.div>
              );
            }) : (
              <div className="text-center py-10 glass-card">
                <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz aktivite kaydınız yok</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sleepRecords.length > 0 ? sleepRecords.map(record => (
              <motion.div key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <MoonIcon size={24} className="text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{record.duration_hours} saat uyku</h4>
                  <p className="text-sm text-gray-400">Kalite: {record.quality}/5</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-10 glass-card">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddActivity(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Aktivite Ekle</h3>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVITY_TYPES.map(type => (
                    <button key={type.id} type="button" onClick={() => setActivityForm({...activityForm, activity_type: type.id})} className={`p-3 rounded-xl border transition flex flex-col items-center gap-1 ${activityForm.activity_type === type.id ? `${type.bg} border-current ${type.color}` : 'border-white/10 text-gray-400'}`}>
                      <type.icon size={20} /><span className="text-xs">{type.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Süre (dk) *</label>
                    <input type="number" value={activityForm.duration_minutes} onChange={e => setActivityForm({...activityForm, duration_minutes: e.target.value})} className="input-modern" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Mesafe (km)</label>
                    <input type="number" step="0.1" value={activityForm.distance_km} onChange={e => setActivityForm({...activityForm, distance_km: e.target.value})} className="input-modern" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Kalori (kcal)</label>
                  <input type="number" value={activityForm.calories_burned} onChange={e => setActivityForm({...activityForm, calories_burned: e.target.value})} className="input-modern" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddActivity(false)} className="flex-1 btn-secondary">İptal</button>
                  <button type="submit" className="flex-1 btn-primary">Kaydet</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sleep Modal */}
      <AnimatePresence>
        {showAddSleep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddSleep(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Uyku Kaydı Ekle</h3>
              <form onSubmit={handleAddSleep} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyku Başlangıcı *</label>
                  <input type="datetime-local" value={sleepForm.sleep_start} onChange={e => setSleepForm({...sleepForm, sleep_start: e.target.value})} className="input-modern" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyanma Zamanı *</label>
                  <input type="datetime-local" value={sleepForm.sleep_end} onChange={e => setSleepForm({...sleepForm, sleep_end: e.target.value})} className="input-modern" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyku Kalitesi: {sleepForm.quality}/5</label>
                  <input type="range" min="1" max="5" value={sleepForm.quality} onChange={e => setSleepForm({...sleepForm, quality: parseInt(e.target.value)})} className="w-full" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddSleep(false)} className="flex-1 btn-secondary">İptal</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl">Kaydet</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MESSAGES PAGE ---
const MessagesPage = ({ user, setPage }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getConversations(user.uid);
      setConversations(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (user) loadConversations(); }, [user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const data = await api.getMessages(conv.id);
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgText = newMessage;
    setNewMessage('');
    const tempMsg = { id: Date.now().toString(), sender_id: user.uid, sender_name: user.displayName, content: msgText, created_at: new Date().toISOString() };
    setMessages([...messages, tempMsg]);
    try {
      await api.sendMessage({ conversation_id: activeConversation.id, sender_id: user.uid, sender_name: user.displayName, sender_photo: user.photoURL, content: msgText });
      loadConversations();
    } catch (e) { console.error(e); }
  };

  const getOtherParticipant = (conv) => {
    const idx = conv.participants.findIndex(p => p !== user.uid);
    return { name: conv.participant_names[idx] || 'Kullanıcı', photo: conv.participant_photos[idx] || '' };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <MessageCircle size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <button onClick={() => setPage('login')} className="btn-primary mt-4">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-24">
      <div className="animated-bg" />
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] flex glass-card overflow-hidden mx-4">
        {/* Conversations */}
        <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-white/10`}>
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Mesajlar</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.length > 0 ? conversations.map(conv => {
              const other = getOtherParticipant(conv);
              return (
                <button key={conv.id} onClick={() => openConversation(conv)} className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition border-b border-white/5 ${activeConversation?.id === conv.id ? 'bg-white/5' : ''}`}>
                  <img src={other.photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-white">{other.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{conv.last_message || 'Henüz mesaj yok'}</p>
                  </div>
                </button>
              );
            }) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Henüz sohbet yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-white/5 rounded-lg"><ChevronLeft size={20} /></button>
              <img src={getOtherParticipant(activeConversation).photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'} alt="" className="w-10 h-10 rounded-xl" />
              <h3 className="font-bold text-white">{getOtherParticipant(activeConversation).name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.sender_id === user.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 ${msg.sender_id === user.uid ? 'message-sent' : 'message-received'}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 input-modern" />
              <button type="submit" disabled={!newMessage.trim()} className="btn-primary px-4 disabled:opacity-50"><Send size={20} /></button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p>Sohbet seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- LOGIN PAGE ---
const LoginPage = ({ onLogin, setPage }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="animated-bg" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-yellow">
          <User size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldin</h1>
        <p className="text-gray-400 mb-8">Spor Ötesine katılmak için giriş yap</p>
        <button onClick={onLogin} className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.64 2 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.19 0 9.49-3.73 9.49-10c0-1.09-.1-1.88-.1-1.88z"/></svg>
          Google ile Devam Et
        </button>
        <button onClick={() => setPage('home')} className="mt-6 text-gray-500 hover:text-gray-300 transition text-sm">← Ana Sayfaya Dön</button>
      </motion.div>
    </div>
  );
};

// --- PROFILE PAGE ---
const ProfilePage = ({ user, setPage }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let profileData = await api.getUser(user.uid);
      if (!profileData) {
        profileData = await api.createUser({ firebase_uid: user.uid, display_name: user.displayName, email: user.email, photo_url: user.photoURL, bio: '' });
      }
      setProfile(profileData);
      setBio(profileData.bio || '');
      const [postsData, followersData, followingData] = await Promise.all([api.getUserPosts(user.uid), api.getFollowers(user.uid), api.getFollowing(user.uid)]);
      setPosts(postsData); setFollowers(followersData); setFollowing(followingData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (user) loadProfile(); }, [user]);

  const handleUpdateBio = async () => {
    try {
      await api.updateUser(user.uid, { bio });
      setProfile({ ...profile, bio });
      setEditMode(false);
    } catch (e) { console.error(e); }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button></div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center mb-8">
          <img src={user.photoURL || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=120'} alt="" className="w-24 h-24 rounded-2xl border-4 border-yellow-500/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
          {editMode ? (
            <div className="mt-4 space-y-2">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kendini tanıt..." className="input-modern resize-none" rows={2} />
              <div className="flex gap-2 justify-center">
                <button onClick={handleUpdateBio} className="btn-primary py-2 px-4">Kaydet</button>
                <button onClick={() => { setEditMode(false); setBio(profile?.bio || ''); }} className="btn-secondary py-2 px-4">İptal</button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-gray-400">{profile?.bio || 'Henüz bio eklenmemiş'}</p>
              <button onClick={() => setEditMode(true)} className="mt-2 text-yellow-500 text-sm hover:underline">Düzenle</button>
            </div>
          )}
          <div className="flex justify-center gap-8 mt-6">
            {[{ value: posts.length, label: 'Gönderi' }, { value: followers.length, label: 'Takipçi' }, { value: following.length, label: 'Takip' }].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-white/10 mb-6">
          {['posts', 'followers', 'following'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-center font-medium transition ${activeTab === tab ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500'}`}>
              {tab === 'posts' ? 'Gönderiler' : tab === 'followers' ? 'Takipçiler' : 'Takip'}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length > 0 ? posts.map(post => <PostCard key={post.id} post={post} user={user} />) : <p className="text-center text-gray-500 py-10">Henüz gönderi yok</p>}
          </div>
        )}
        {activeTab === 'followers' && (
          <div className="space-y-3">
            {followers.length > 0 ? followers.map(f => <UserCard key={f.id} profile={f} currentUser={user} />) : <p className="text-center text-gray-500 py-10">Henüz takipçi yok</p>}
          </div>
        )}
        {activeTab === 'following' && (
          <div className="space-y-3">
            {following.length > 0 ? following.map(f => <UserCard key={f.id} profile={f} currentUser={user} />) : <p className="text-center text-gray-500 py-10">Henüz takip yok</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// --- NUTRITION PAGE ---
const NutritionPage = ({ user, setPage }) => {
  const [activeTab, setActiveTab] = useState("hesapla");
  const [val, setVal] = useState({ kilo: "", boy: "", yas: "", cinsiyet: "erkek", aktivite: "1.2" });
  const [bmrResult, setBmrResult] = useState(null);
  const [mealInput, setMealInput] = useState("");
  const [mealAnalysis, setMealAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);

  const handlePhotoAnalysis = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
        
        // Call Vision API
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCX9mTodIiwsWk0-_ux1AYgMbniUcqgAuo`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { content: base64Image.split(',')[1] },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 10 },
                  { type: 'TEXT_DETECTION' }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        const labels = data.responses[0]?.labelAnnotations || [];
        
        // Filter food-related labels
        const foodLabels = labels.filter(l => 
          ['food', 'dish', 'cuisine', 'meal', 'fruit', 'vegetable', 'meat', 'bread', 'rice', 'pasta', 'salad', 'drink', 'yemek', 'meyve', 'sebze'].some(
            keyword => l.description.toLowerCase().includes(keyword)
          )
        ).slice(0, 5);

        if (foodLabels.length > 0) {
          const foodItems = foodLabels.map(l => l.description).join(', ');
          
          // Get AI analysis
          const aiResult = await askGemini(
            `Fotoğrafta tespit edilen yiyecekler: ${foodItems}. Bunlar için tahmini kalori, protein, karbonhidrat ve yağ değerlerini ver. Ayrıca sağlık önerisi yap. Türkçe.`
          );
          
          setPhotoAnalysis({
            foodItems: foodLabels.map(l => l.description),
            analysis: aiResult
          });
        } else {
          alert('❌ Fotoğrafta yiyecek tespit edilemedi. Lütfen daha net bir fotoğraf deneyin.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo analysis error:', error);
      alert('❌ Fotoğraf analizi başarısız.');
    }
    setAnalyzingPhoto(false);
  };

  const hesaplaBMR = (e) => {
    e.preventDefault();
    let bmr = val.cinsiyet === "erkek" ? (10 * Number(val.kilo)) + (6.25 * Number(val.boy)) - (5 * Number(val.yas)) + 5 : (10 * Number(val.kilo)) + (6.25 * Number(val.boy)) - (5 * Number(val.yas)) - 161;
    setBmrResult(Math.round(bmr * Number(val.aktivite)));
  };

  const analizEt = async (e) => {
    e.preventDefault();
    if (!mealInput) return;
    setLoading(true);
    try {
      const res = await askGemini(`Diyetisyen gibi davran. Şu öğünü analiz et: "${mealInput}". Toplam Kalori, Makro Besinler ve sağlık yorumu yap. Türkçe.`);
      setMealAnalysis(res || "Hata");
    } catch (e) { setMealAnalysis("Analiz yapılamadı."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"><ChevronLeft size={20} /> Ana Sayfa</button>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4"><Flame className="inline mr-2 text-orange-500" />AI Beslenme Uzmanı</h1>
          <p className="text-gray-400">Kalori hesapla veya yediğini analiz et</p>
        </div>
        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="nutrition"
            title="Beslenme Koçu"
            icon={Utensils}
            color="text-orange-500"
            placeholder="Beslenme ve diyet hakkında soru sorun..."
          />
        </div>

        {/* Photo Analysis Button */}
        <div className="mb-6">
          <label className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all cursor-pointer">
            {analyzingPhoto ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Fotoğraf analiz ediliyor...
              </>
            ) : (
              <>
                <Camera size={20} />
                Yemek Fotoğrafı Analiz Et
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoAnalysis}
              className="hidden"
              disabled={analyzingPhoto}
            />
          </label>
        </div>

        {/* Photo Analysis Result */}
        {photoAnalysis && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Camera size={20} className="text-purple-500" />
              Fotoğraf Analizi
            </h3>
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Tespit edilen yiyecekler:</p>
              <div className="flex flex-wrap gap-2">
                {photoAnalysis.foodItems.map((food, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-gray-300 whitespace-pre-line">{photoAnalysis.analysis}</div>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setActiveTab("hesapla")} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === "hesapla" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "bg-white/5 text-gray-400"}`}>İhtiyaç Hesapla</button>
          <button onClick={() => setActiveTab("analiz")} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === "analiz" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "bg-white/5 text-gray-400"}`}><Utensils size={18} /> Analiz Et</button>
        </div>
        <div className="glass-card p-8">
          {activeTab === "hesapla" ? (
            <form onSubmit={hesaplaBMR} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">Kilo (kg)</label><input type="number" value={val.kilo} onChange={e=>setVal({...val, kilo:e.target.value})} className="input-modern" required/></div>
                <div><label className="block text-sm text-gray-400 mb-2">Boy (cm)</label><input type="number" value={val.boy} onChange={e=>setVal({...val, boy:e.target.value})} className="input-modern" required/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">Yaş</label><input type="number" value={val.yas} onChange={e=>setVal({...val, yas:e.target.value})} className="input-modern" required/></div>
                <div><label className="block text-sm text-gray-400 mb-2">Cinsiyet</label><select value={val.cinsiyet} onChange={e=>setVal({...val, cinsiyet:e.target.value})} className="input-modern"><option value="erkek">Erkek</option><option value="kadin">Kadın</option></select></div>
              </div>
              <div><label className="block text-sm text-gray-400 mb-2">Aktivite</label><select value={val.aktivite} onChange={e=>setVal({...val, aktivite:e.target.value})} className="input-modern"><option value="1.2">Hareketsiz</option><option value="1.375">Az Hareketli</option><option value="1.55">Orta</option><option value="1.725">Çok Hareketli</option></select></div>
              <button className="w-full btn-primary">HESAPLA</button>
              {bmrResult && <div className="mt-6 text-center glass-card p-6"><p className="text-gray-400 mb-2">Günlük İhtiyacın</p><p className="text-4xl font-black gradient-text">{bmrResult} kcal</p></div>}
            </form>
          ) : (
            <div className="space-y-6">
              <textarea value={mealInput} onChange={(e) => setMealInput(e.target.value)} placeholder="Örn: Sabah 2 yumurta, 5 zeytin, 1 dilim peynir..." className="input-modern h-32 resize-none" />
              <button onClick={analizEt} disabled={loading} className="w-full btn-primary disabled:opacity-50">{loading ? "Hesaplanıyor..." : <><ChefHat className="inline mr-2" /> Analiz Et</>}</button>
              {mealAnalysis && <div className="glass-card p-6 whitespace-pre-line text-gray-300">{mealAnalysis}</div>}
            </div>
          )}
        </div>
        <div className="mt-8"><AdBanner /></div>
      </div>
    </div>
  );
};

// --- ANALYSIS PAGE ---
const AnalysisPage = ({ user, setPage }) => {
  const [takim1, setTakim1] = useState("");
  const [takim2, setTakim2] = useState("");
  const [analiz, setAnaliz] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!takim1 || !takim2) return;
    setLoading(true);
    try {
      const text = await askGemini(`Futbol analisti gibi davran. ${takim1} vs ${takim2} maçı için taktiksel analiz ve skor tahmini yap. Türkçe.`);
      setAnaliz(text || "Hata");
    } catch (e) { setAnaliz("Hata: " + e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"><ChevronLeft size={20} /> Ana Sayfa</button>
        
        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="match_analysis"
            title="Maç Analizi Koçu"
            icon={Trophy}
            color="text-blue-500"
            placeholder="Maç taktikleri ve analiz hakkında soru sorun..."
          />
        </div>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><BrainCircuit size={32} className="text-purple-500" /></div>
            <h1 className="text-3xl font-bold text-white">AI Maç Analisti</h1>
          </div>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={takim1} onChange={e=>setTakim1(e.target.value)} placeholder="Ev Sahibi" className="input-modern" required />
              <input type="text" value={takim2} onChange={e=>setTakim2(e.target.value)} placeholder="Deplasman" className="input-modern" required />
            </div>
            <button disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50">{loading ? 'Analiz...' : <><BrainCircuit className="inline mr-2" /> Analiz Et</>}</button>
          </form>
          {analiz && <div className="mt-8 glass-card p-6 whitespace-pre-line text-gray-300">{analiz}</div>}
        </div>
        <div className="mt-8"><AdBanner /></div>
      </div>
    </div>
  );
};

// --- FOOTER ---
const Footer = () => (
  <footer className="bg-slate-900/50 border-t border-white/5 py-8 hidden md:block">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Trophy size={24} className="text-yellow-500" />
        <span className="text-xl font-black gradient-text">SPOR ÖTESİ</span>
      </div>
      <p className="text-gray-500 text-sm">© 2025 Yapay zeka destekli vizyoner spor platformu</p>
    </div>
  </footer>
);

// --- MAIN APP ---
function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        setLoading(false);
        if (u) {
          try {
            await api.createUser({ firebase_uid: u.uid, display_name: u.displayName, email: u.email, photo_url: u.photoURL, bio: '' });
          } catch (e) { console.error('User sync error:', e); }
        }
      });
      return () => unsub();
    }
  }, []);

  const handleLogin = async () => {
    if (auth) {
      try { 
        await signInWithPopup(auth, googleProvider); 
        setPage('home'); 
      }
      catch (e) { 
        console.error("Login error:", e); 
        if (e.code === 'auth/unauthorized-domain') {
          alert('⚠️ Firebase Domain Hatası!\n\nBu sorunu çözmek için:\n1. Firebase Console\'a gidin (console.firebase.google.com)\n2. Authentication → Settings → Authorized Domains\n3. Bu domain\'i ekleyin: ' + window.location.hostname + '\n\nVercel\'e deploy ettiğinizde bu sorun otomatik çözülecektir.');
        } else {
          alert('Giriş hatası: ' + (e.message || 'Bilinmeyen hata'));
        }
      }
    }
  };

  const handleLogout = async () => {
    if (auth) { await signOut(auth); setPage('home'); }
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage user={user} setPage={setPage} onLogout={handleLogout} />;
      case 'login': return <LoginPage onLogin={handleLogin} setPage={setPage} />;
      case 'social': return <SocialPage user={user} setPage={setPage} />;
      case 'tracker': return <TrackerPage user={user} setPage={setPage} />;
      case 'yoga': return <YogaPage user={user} setPage={setPage} />;
      case 'donate': return <DonatePage user={user} setPage={setPage} />;
      case 'messages': return <MessagesPage user={user} setPage={setPage} />;
      case 'profile': return <ProfilePage user={user} setPage={setPage} />;
      case 'nutrition': return <NutritionPage user={user} setPage={setPage} />;
      case 'analysis': return <AnalysisPage user={user} setPage={setPage} />;
      case 'notifications': return <NotificationsPage user={user} setPage={setPage} />;
      case 'analytics': return <AnalyticsPage user={user} setPage={setPage} />;
      case 'goals': return <GoalsPage user={user} setPage={setPage} />;
      default: return <HomePage user={user} setPage={setPage} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <NavBar user={user} setPage={setPage} currentPage={page} onLogout={handleLogout} />
      <main>
        <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
