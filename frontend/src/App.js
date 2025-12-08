import React, { useState, useEffect, useRef } from 'react';
import { 
  User, ArrowRight, X, Activity, Flame, MessageCircle, PlusCircle, LogOut, BrainCircuit, 
  Sparkles, Dumbbell, Utensils, ChefHat, Heart, Wallet, Search, MapPin, Send, Video, 
  Image, Users, Home, Footprints, Timer, Zap, TrendingUp, Moon as MoonIcon, ChevronLeft,
  Trash2, Share, MessageSquare, Trophy, Target, Gift, Megaphone, Star, Crown, Rocket,
  Globe, Award, Coffee, ShoppingBag, Smartphone, Headphones, Volume2, Camera, Bookmark, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import "./App.css";

// Import utilities and API
import { TURKEY_CITIES, ACTIVITY_TYPES, ADS, firebaseConfig } from './utils/constants';
import { askGemini } from './utils/helpers';
import api from './api';

// Import components
import AdBanner from './components/common/AdBanner';
import StoryViewer from './components/common/StoryViewer';
import UserProfilePage from './pages/UserProfilePage';
import AICoach from './components/common/AICoach';
import ReelsViewer from './components/common/ReelsViewer';
import UserProfileModal from './components/common/UserProfileModal';
import NavBar from './components/common/NavBar';
import PostCard from './components/social/PostCard';
import CreatePostModal from './components/social/CreatePostModal';
import CreateReelModal from './components/social/CreateReelModal';
import UserCard from './components/social/UserCard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import Footer from './components/common/Footer';

// Import page components (refactored from App.js)
import SocialPage from './pages/SocialPage';
import TrackerPage from './pages/TrackerPage';
import YogaPage from './pages/YogaPage';
import DonatePage from './pages/DonatePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MessagesPage from './pages/MessagesPage';
import NutritionPage from './pages/NutritionPage';
import AnalysisPage from './pages/AnalysisPage';

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
// NavBar component moved to /components/common/NavBar.js
// PostCard component moved to /components/social/PostCard.js
// CreatePostModal component moved to /components/social/CreatePostModal.js
// UserCard component moved to /components/social/UserCard.js
// HomePage component moved to /pages/HomePage.js

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
// --- MAIN APP ---
function App() {
  console.log('%c🚀 SPOR ÖTESİ - SUNUM VERSİYONU', 'color: #ec4899; font-size: 20px; font-weight: bold; background: black; padding: 10px;');
  console.log('%c✅ Instagram Benzeri Sosyal Medya - YENİ TASARIM AKTİF', 'color: #10b981; font-size: 14px;');
  
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!auth);
  const [viewingUserId, setViewingUserId] = useState(null);

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
    // User Profile View
    if (viewingUserId) {
      return (
        <UserProfilePage
          userId={viewingUserId}
          currentUser={user}
          onBack={() => setViewingUserId(null)}
          setPage={setPage}
        />
      );
    }

    switch (page) {
      case 'home': return <HomePage user={user} setPage={setPage} onLogout={handleLogout} />;
      case 'login': return <LoginPage onLogin={handleLogin} setPage={setPage} />;
      case 'social': return <SocialPage user={user} setPage={setPage} onViewProfile={setViewingUserId} />;
      case 'tracker': return <TrackerPage user={user} setPage={setPage} />;
      case 'yoga': return <YogaPage user={user} setPage={setPage} />;
      case 'donate': return <DonatePage user={user} setPage={setPage} />;
      case 'messages': return <ChatPage user={user} setPage={setPage} />;
      case 'profile': return <ProfilePage user={user} setPage={setPage} onViewProfile={setViewingUserId} />;
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
