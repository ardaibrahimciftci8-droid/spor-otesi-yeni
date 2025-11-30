import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default LoginPage;