import React, { useState } from "react";
import { Heart, Search, MapPin, Wallet, X, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../components/common/AdBanner";
import { TURKEY_CITIES } from "../utils/constants";

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

export default DonatePage;
