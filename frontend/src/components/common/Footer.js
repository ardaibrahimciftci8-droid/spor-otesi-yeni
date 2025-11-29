import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="mt-auto py-8 border-t border-white/10">
    <div className="container mx-auto px-4 text-center text-gray-400">
      <p className="flex items-center justify-center gap-2">
        Made with <Heart size={16} className="text-red-500" /> for Turkish Sports Community
      </p>
      <p className="mt-2 text-sm">© 2024 Spor Ötesi. Tüm hakları saklıdır.</p>
    </div>
  </footer>
);

export default Footer;
