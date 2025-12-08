import React, { useState, useEffect } from "react";
import { TrendingUp, Activity, Flame, Timer, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";

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

export default AnalyticsPage;
