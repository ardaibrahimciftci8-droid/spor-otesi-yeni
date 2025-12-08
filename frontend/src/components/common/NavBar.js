import React from 'react';
import { Home, Users, Activity, Sparkles, Heart, User, TrendingUp, MessageCircle, LogOut } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 floating-nav z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:rounded-b-3xl safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="hidden md:flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
            <img src="/logo.png" alt="Spor Ötesi Logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-2xl font-black gradient-text-elite tracking-tight">SPOR ÖTESİ</span>
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
                <button onClick={() => setPage('messages')} className="p-2 text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10 rounded-xl transition relative" title="Mesajlar">
                  <MessageCircle size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-electric-blue rounded-full pulse-glow"></span>
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

export default NavBar;