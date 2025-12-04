import React from 'react';
import { Users, Activity, Heart, MessageCircle, Flame, BrainCircuit, ArrowRight, Rocket, Target, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import AdBanner from '../components/common/AdBanner';

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
    <div className="min-h-screen pb-24 md:pb-8 md:pt-28 bg-elite-bg">
      <div className="fixed inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-neon-lime/5 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-36 md:pb-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
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

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => setPage('social')} className="btn-primary flex items-center justify-center gap-3 text-lg px-8 py-4 shadow-2xl w-full sm:w-auto">
              <Users size={24} />Keşfet
            </button>
            <button onClick={() => setPage('donate')} className="btn-secondary flex items-center justify-center gap-3 text-lg px-8 py-4 shadow-2xl w-full sm:w-auto">
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

export default HomePage;