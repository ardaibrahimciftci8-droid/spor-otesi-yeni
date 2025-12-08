// TrackerPage extracted from App.js
import React, { useState, useEffect } from "react";
import { Activity, Footprints, Timer, TrendingUp, Moon as MoonIcon, PlusCircle, Sparkles, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";
import { ACTIVITY_TYPES } from "../utils/constants";
import { askGemini } from "../utils/helpers";
import AICoach from "../components/common/AICoach";

const TrackerPage = ({ user, setPage }) => {
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [sleepRecords, setSleepRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [sleepStats, setSleepStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activityForm, setActivityForm] = useState({ activity_type: 'running', duration_minutes: '', distance_km: '', calories_burned: '', notes: '' });
  const [sleepForm, setSleepForm] = useState({ sleep_start: '', sleep_end: '', quality: 3, notes: '' });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [activitiesData, sleepData, statsData, sleepStatsData] = await Promise.all([
        api.getActivities(user.uid), api.getSleepRecords(user.uid),
        api.getActivityStats(user.uid, 7), api.getSleepStats(user.uid, 7)
      ]);
      setActivities(activitiesData); setSleepRecords(sleepData);
      setStats(statsData); setSleepStats(sleepStatsData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.duration_minutes) return;
    try {
      const activity = await api.createActivity({
        user_id: user.uid, activity_type: activityForm.activity_type,
        duration_minutes: parseInt(activityForm.duration_minutes),
        distance_km: activityForm.distance_km ? parseFloat(activityForm.distance_km) : null,
        calories_burned: activityForm.calories_burned ? parseInt(activityForm.calories_burned) : null,
        notes: activityForm.notes || null
      });
      setActivities([activity, ...activities]);
      setShowAddActivity(false);
      setActivityForm({ activity_type: 'running', duration_minutes: '', distance_km: '', calories_burned: '', notes: '' });
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    if (!sleepForm.sleep_start || !sleepForm.sleep_end) return;
    try {
      const record = await api.createSleepRecord({
        user_id: user.uid, sleep_start: new Date(sleepForm.sleep_start).toISOString(),
        sleep_end: new Date(sleepForm.sleep_end).toISOString(), quality: sleepForm.quality, notes: sleepForm.notes || null
      });
      setSleepRecords([record, ...sleepRecords]);
      setShowAddSleep(false);
      setSleepForm({ sleep_start: '', sleep_end: '', quality: 3, notes: '' });
      loadData();
    } catch (e) { console.error(e); }
  };

  const getAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await api.analyzeActivity(user.uid);
      setAiAnalysis(res.analysis);
    } catch (e) {
      setAiAnalysis('Analiz yapılamadı.');
    }
    setAiLoading(false);
  };

  const getActivityIcon = (type) => ACTIVITY_TYPES.find(a => a.id === type) || ACTIVITY_TYPES[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <Activity size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Aktivitelerini takip etmek için giriş yap</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Egzersiz Takibi</h1>
          <p className="text-gray-400">AI destekli aktivite ve uyku takibi</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Footprints, value: stats.total_activities, label: 'Aktivite', color: 'text-green-500' },
              { icon: Timer, value: stats.total_duration_minutes, label: 'Dakika', color: 'text-blue-500' },
              { icon: TrendingUp, value: stats.total_distance_km, label: 'km', color: 'text-yellow-500' },
              { icon: Flame, value: stats.total_calories_burned, label: 'kcal', color: 'text-orange-500' },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="stats-card text-center">
                <stat.icon size={28} className={`mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="exercise"
            title="Egzersiz Koçu"
            icon={Dumbbell}
            color="text-purple-500"
            placeholder="Antrenman programı veya egzersiz tekniği hakkında soru sorun..."
          />
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('activities')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'activities' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black' : 'bg-white/5 text-gray-400'}`}>
            <Activity size={20} className="inline mr-2" />Aktiviteler
          </button>
          <button onClick={() => setActiveTab('sleep')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'sleep' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
            <MoonIcon size={20} className="inline mr-2" />Uyku
          </button>
        </div>

        {/* Add Button */}
        <button onClick={() => activeTab === 'activities' ? setShowAddActivity(true) : setShowAddSleep(true)} className={`w-full py-4 rounded-xl font-bold transition mb-6 flex items-center justify-center gap-2 ${activeTab === 'activities' ? 'bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/30 hover:bg-purple-500/20'}`}>
          <PlusCircle size={20} />
          {activeTab === 'activities' ? 'Aktivite Ekle' : 'Uyku Kaydı Ekle'}
        </button>

        {/* Content */}
        {activeTab === 'activities' ? (
          <div className="space-y-4">
            {activities.length > 0 ? activities.map(activity => {
              const actType = getActivityIcon(activity.activity_type);
              return (
                <motion.div key={activity.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${actType.bg}`}>
                      <actType.icon size={24} className={actType.color} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{actType.name}</h4>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>{activity.duration_minutes} dk</span>
                        {activity.distance_km && <span>{activity.distance_km} km</span>}
                        {activity.calories_burned && <span>{activity.calories_burned} kcal</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-10 glass-card">
                <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz aktivite kaydınız yok</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sleepRecords.length > 0 ? sleepRecords.map(record => (
              <motion.div key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <MoonIcon size={24} className="text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{record.duration_hours} saat uyku</h4>
                  <p className="text-sm text-gray-400">Kalite: {record.quality}/5</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-10 glass-card">
                <MoonIcon size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz uyku kaydınız yok</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddActivity && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddActivity(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Aktivite Ekle</h3>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVITY_TYPES.map(type => (
                    <button key={type.id} type="button" onClick={() => setActivityForm({...activityForm, activity_type: type.id})} className={`p-3 rounded-xl border transition flex flex-col items-center gap-1 ${activityForm.activity_type === type.id ? `${type.bg} border-current ${type.color}` : 'border-white/10 text-gray-400'}`}>
                      <type.icon size={20} /><span className="text-xs">{type.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Süre (dk) *</label>
                    <input type="number" value={activityForm.duration_minutes} onChange={e => setActivityForm({...activityForm, duration_minutes: e.target.value})} className="input-modern" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Mesafe (km)</label>
                    <input type="number" step="0.1" value={activityForm.distance_km} onChange={e => setActivityForm({...activityForm, distance_km: e.target.value})} className="input-modern" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Kalori (kcal)</label>
                  <input type="number" value={activityForm.calories_burned} onChange={e => setActivityForm({...activityForm, calories_burned: e.target.value})} className="input-modern" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddActivity(false)} className="flex-1 btn-secondary">İptal</button>
                  <button type="submit" className="flex-1 btn-primary">Kaydet</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sleep Modal */}
      <AnimatePresence>
        {showAddSleep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddSleep(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Uyku Kaydı Ekle</h3>
              <form onSubmit={handleAddSleep} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyku Başlangıcı *</label>
                  <input type="datetime-local" value={sleepForm.sleep_start} onChange={e => setSleepForm({...sleepForm, sleep_start: e.target.value})} className="input-modern" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyanma Zamanı *</label>
                  <input type="datetime-local" value={sleepForm.sleep_end} onChange={e => setSleepForm({...sleepForm, sleep_end: e.target.value})} className="input-modern" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Uyku Kalitesi: {sleepForm.quality}/5</label>
                  <input type="range" min="1" max="5" value={sleepForm.quality} onChange={e => setSleepForm({...sleepForm, quality: parseInt(e.target.value)})} className="w-full" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddSleep(false)} className="flex-1 btn-secondary">İptal</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl">Kaydet</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MESSAGES PAGE ---

export default TrackerPage;
