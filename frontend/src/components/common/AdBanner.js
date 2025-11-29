import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ADS } from '../../utils/constants';

const AdBanner = () => {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const ad = ADS[currentAd];

  return (
    <motion.div
      key={ad.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ad-banner cursor-pointer hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ad.color} flex items-center justify-center`}>
          <ad.icon size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white">{ad.title}</h4>
          <p className="text-sm text-gray-400">{ad.desc}</p>
        </div>
        <ArrowRight size={20} className="text-gray-400" />
      </div>
    </motion.div>
  );
};

export default AdBanner;
