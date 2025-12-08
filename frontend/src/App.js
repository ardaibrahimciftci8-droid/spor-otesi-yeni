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

// ===== ALL PAGE COMPONENTS REFACTORED TO /pages/ DIRECTORY =====
// DonatePage moved to /pages/DonatePage.js
// NotificationsPage moved to /pages/NotificationsPage.js
// GoalsPage moved to /pages/GoalsPage.js
// AnalyticsPage moved to /pages/AnalyticsPage.js
// SocialPage moved to /pages/SocialPage.js
// YogaPage moved to /pages/YogaPage.js
// TrackerPage moved to /pages/TrackerPage.js
// MessagesPage moved to /pages/MessagesPage.js
// ProfilePage moved to /pages/ProfilePage.js
// NutritionPage moved to /pages/NutritionPage.js
// AnalysisPage moved to /pages/AnalysisPage.js

// ===== MAIN APP COMPONENT =====
function App() {
  console.log('%c🚀 SPOR ÖTESİ - SUNUM MODU AKTİF', 'color: #ec4899; font-size: 20px; font-weight: bold; background: black; padding: 10px;');
  console.log('%c✅ Otomatik Giriş: Mock User Yüklendi', 'color: #10b981; font-size: 14px;');
  
  // 🎯 SUNUM MODU: LocalStorage'dan kullanıcı bilgilerini yükle
  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedDisplayName = localStorage.getItem('displayName');
      const savedPhoto = localStorage.getItem('profileImage');
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Kaydedilmiş isim varsa güncelle
        if (savedDisplayName) {
          parsedUser.displayName = savedDisplayName;
        }
        // Kaydedilmiş foto varsa güncelle
        if (savedPhoto) {
          parsedUser.photoURL = savedPhoto;
        }
        console.log('✅ Kullanıcı bilgileri LocalStorage\'dan yüklendi:', parsedUser.displayName);
        return parsedUser;
      }
    } catch (e) {
      console.log('LocalStorage okuma hatası:', e);
    }
    
    // İlk kez giriş - Default user
    const DEMO_USER = {
      uid: 'demo_user_1',
      displayName: 'Misafir Sporcu',
      email: 'demo@sporotesi.com',
      photoURL: 'https://ui-avatars.com/api/?background=f59e0b&color=fff&name=Misafir+Sporcu&size=200'
    };
    
    // LocalStorage'a kaydet
    localStorage.setItem('currentUser', JSON.stringify(DEMO_USER));
    return DEMO_USER;
  };
  
  const [page, setPage] = useState('social');
  const [user, setUser] = useState(loadUserFromStorage()); // LocalStorage'dan yükle
  const [loading, setLoading] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);

  // 🎯 SUNUM MODU: User değiştiğinde LocalStorage'a kaydet
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('💾 Kullanıcı bilgileri LocalStorage\'a kaydedildi');
    }
  }, [user]);

  // 🎯 SUNUM MODU: Login devre dışı - Zaten giriş yapılmış
  const handleLogin = async () => {
    console.log('🎯 Sunum Modu: Login bypass - Zaten giriş yapılmış');
    setPage('social'); // Direkt sosyal sayfaya git
  };

  // 🎯 SUNUM MODU: Logout devre dışı - Her zaman giriş yapılı kal
  const handleLogout = async () => {
    console.log('🎯 Sunum Modu: Logout devre dışı');
    // Çıkış yapma, her zaman giriş yapılı kal
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
      case 'login': return <SocialPage user={user} setPage={setPage} onViewProfile={setViewingUserId} />; // 🎯 SUNUM: Login bypass, direkt social
      case 'social': return <SocialPage user={user} setPage={setPage} onViewProfile={setViewingUserId} />;
      case 'tracker': return <TrackerPage user={user} setPage={setPage} />;
      case 'yoga': return <YogaPage user={user} setPage={setPage} />;
      case 'donate': return <DonatePage user={user} setPage={setPage} />;
      case 'messages': return <ChatPage user={user} setPage={setPage} />;
      case 'chat': return <ChatPage user={user} setPage={setPage} />; // 🎯 SUNUM: Chat alias
      case 'profile': return <ProfilePage user={user} setPage={setPage} onViewProfile={setViewingUserId} />;
      case 'nutrition': return <NutritionPage user={user} setPage={setPage} />;
      case 'analysis': return <AnalysisPage user={user} setPage={setPage} />;
      case 'notifications': return <NotificationsPage user={user} setPage={setPage} />;
      case 'analytics': return <AnalyticsPage user={user} setPage={setPage} />;
      case 'goals': return <GoalsPage user={user} setPage={setPage} />;
      default: return <SocialPage user={user} setPage={setPage} onViewProfile={setViewingUserId} />; // 🎯 SUNUM: Default social
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
