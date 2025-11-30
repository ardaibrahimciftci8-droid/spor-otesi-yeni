import React from 'react';
import { Trophy } from 'lucide-react';

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

export default Footer;