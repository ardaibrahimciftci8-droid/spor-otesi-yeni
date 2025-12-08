import React, { useState, useEffect } from "react";
import { Trophy, Target, Plus, X, Flame, Check, Award, Megaphone, Star, Crown, Rocket, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

const GoalsPage = ({ user, setPage }) => {
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [goalForm, setGoalForm] = useState({
    type: 'fitness',
    title: '',
    description: '',
    target: '',
    unit: 'count'
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, achievementsData, reportsData] = await Promise.all([
        api.getUserGoals(user.uid),
        api.getUserAchievements(user.uid),
        api.getUserReports(user.uid, 5)
      ]);
      setGoals(goalsData);
      setAchievements(achievementsData);
      setReports(reportsData);
      
      // Check for new achievements
      await api.checkAchievements(user.uid);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const newGoal = await api.createGoal(
        user.uid,
        goalForm.type,
        goalForm.title,
        goalForm.description,
        parseFloat(goalForm.target) || null,
        goalForm.unit
      );
      setGoals([newGoal, ...goals]);
      setShowCreateGoal(false);
      setGoalForm({ type: 'fitness', title: '', description: '', target: '', unit: 'count' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      const report = await api.generateProgressReport(user.uid, type);
      setReports([report, ...reports]);
      setShowReports(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <Target size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Hedeflerini görmek için giriş yap</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target size={32} className="text-green-500" />
            <h1 className="text-3xl font-bold text-white">Hedeflerim & Başarılar</h1>
          </div>
          <p className="text-gray-400">İlerlemeni takip et ve rozetlerini topla</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Goals & Reports */}
            <div className="md:col-span-2 space-y-6">
              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setShowCreateGoal(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <PlusCircle size={20} />
                  Yeni Hedef
                </button>
                <button onClick={() => handleGenerateReport('weekly')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2">
                  <TrendingUp size={20} />
                  Rapor Oluştur
                </button>
              </div>

              {/* Goals */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Aktif Hedefler</h2>
                <div className="space-y-3">
                  {goals.filter(g => g.status === 'active').length > 0 ? (
                    goals.filter(g => g.status === 'active').map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                            <p className="text-sm text-gray-400">{goal.description}</p>
                          </div>
                          <span className="text-xs px-3 py-1 bg-green-500/20 text-green-500 rounded-full">
                            {goal.goal_type}
                          </span>
                        </div>
                        {goal.target_value && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-400">İlerleme</span>
                              <span className="text-white font-bold">
                                {goal.current_value} / {goal.target_value} {goal.unit}
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 glass-card">
                      <Target size={48} className="mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-500">Henüz aktif hedef yok</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reports */}
              {reports.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Son Raporlar</h2>
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp size={20} className="text-purple-500" />
                          <h3 className="font-bold text-white capitalize">{report.report_type} Rapor</h3>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(report.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">{report.summary}</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-500">{report.activities_count}</p>
                            <p className="text-xs text-gray-500">Aktivite</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-teal-500">{report.yoga_sessions}</p>
                            <p className="text-xs text-gray-500">Yoga</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-500">{report.coach_interactions}</p>
                            <p className="text-xs text-gray-500">AI Koç</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Achievements */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Rozetler</h2>
              <div className="glass-card p-6">
                {achievements.length > 0 ? (
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                      >
                        <span className="text-4xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{achievement.title}</h4>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500">Henüz rozet yok. Aktivite yap ve rozetlerini kazan!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-8 w-full max-w-md relative"
            >
              <button onClick={() => setShowCreateGoal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Yeni Hedef Oluştur</h2>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hedef Türü</label>
                  <select value={goalForm.type} onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value })} className="input-modern">
                    <option value="fitness">Fitness</option>
                    <option value="yoga">Yoga</option>
                    <option value="nutrition">Beslenme</option>
                    <option value="weight">Kilo</option>
                    <option value="sleep">Uyku</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    placeholder="Örn: 5 km koş"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Açıklama</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    placeholder="Detaylar..."
                    className="input-modern resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Hedef</label>
                    <input
                      type="number"
                      value={goalForm.target}
                      onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                      placeholder="10"
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Birim</label>
                    <select value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} className="input-modern">
                      <option value="count">Adet</option>
                      <option value="km">Kilometre</option>
                      <option value="kg">Kilogram</option>
                      <option value="hours">Saat</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all">
                  Hedef Oluştur
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ANALYTICS PAGE ---

export default GoalsPage;
