import React, { useState, useEffect } from "react";
import { Heart, Target, Volume2, Headphones, Sparkles, PlusCircle, X, ArrowRight, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import AdBanner from "../components/common/AdBanner";
import AICoach from "../components/common/AICoach";

const YogaPage = ({ user, setPage }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [programForm, setProgramForm] = useState({
    name: '',
    duration: 30,
    difficulty: 'beginner',
    preferences: ''
  });
  const [generatingProgram, setGeneratingProgram] = useState(false);

  const loadPrograms = async () => {
    // 🎯 SUNUM MODU: Backend bypass - Programlar boş
    setLoading(false);
  };

  useEffect(() => {
    // 🎯 SUNUM MODU: Programları yükleme
    setLoading(false);
  }, [user]);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!user) return;
    setGeneratingProgram(true);
    
    // 🎯 SUNUM MODU: Simüle edilmiş program oluşturma
    setTimeout(() => {
      const demoProgram = {
        id: Date.now().toString(),
        user_id: user.uid,
        name: programForm.name || "Sabah Yoga Rutini",
        duration: programForm.duration,
        difficulty: programForm.difficulty,
        exercises: [
          "Güneş Selamı (10 tekrar)",
          "Aşağı Bakan Köpek Pozisyonu (2 dk)",
          "Savaşçı Pozu I-II (her biri 1.5 dk)",
          "Ağaç Pozisyonu (1 dk)",
          "Şavazana (5 dk)"
        ],
        created_at: new Date().toISOString()
      };
      
      setPrograms([demoProgram, ...programs]);
      setShowCreateProgram(false);
      setProgramForm({ name: '', duration: 30, difficulty: 'beginner', preferences: '' });
      setGeneratingProgram(false);
      
      alert('✅ Yoga programı başarıyla oluşturuldu!');
    }, 1500);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <Sparkles size={64} className="mx-auto text-teal-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Yoga ve meditasyon programlarına erişmek için giriş yap</p>
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
            <Sparkles size={32} className="text-teal-500" />
            <h1 className="text-3xl font-bold text-white">Yoga & Meditasyon</h1>
          </div>
          <p className="text-gray-400">AI destekli kişiselleştirilmiş yoga ve meditasyon programları</p>
        </motion.div>

        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="yoga"
            title="Yoga Koçu"
            icon={Sparkles}
            color="text-teal-500"
            placeholder="Yoga veya meditasyon hakkında soru sorun..."
          />
        </div>

        {/* Create Program Button */}
        <button
          onClick={() => setShowCreateProgram(true)}
          className="w-full glass-card p-6 mb-8 hover:border-white/20 transition text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
              <PlusCircle size={28} className="text-teal-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yeni Program Oluştur</h3>
              <p className="text-sm text-gray-400">AI ile kişiselleştirilmiş yoga programı</p>
            </div>
          </div>
          <ArrowRight size={24} className="text-gray-400" />
        </button>

        {/* Programs List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Programlarım</h2>
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : programs.length > 0 ? (
            programs.map((program) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{program.program_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Timer size={16} />
                        {program.duration_minutes} dk
                      </span>
                      <span className="capitalize">{program.difficulty === 'beginner' ? 'Başlangıç' : program.difficulty === 'intermediate' ? 'Orta' : 'İleri'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(program.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="text-gray-300 text-sm whitespace-pre-line">
                  {program.exercises[0]?.description?.substring(0, 200)}...
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 glass-card">
              <Sparkles size={48} className="mx-auto text-teal-500 opacity-50 mb-4" />
              <p className="text-gray-500">Henüz program yok</p>
              <button onClick={() => setShowCreateProgram(true)} className="mt-4 btn-primary">
                İlk Programını Oluştur
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Program Modal */}
      <AnimatePresence>
        {showCreateProgram && (
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
              <button
                onClick={() => setShowCreateProgram(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Yeni Program Oluştur</h2>

              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Program Adı</label>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                    placeholder="Örn: Sabah Rutini"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Süre (dakika)</label>
                  <select
                    value={programForm.duration}
                    onChange={(e) => setProgramForm({ ...programForm, duration: parseInt(e.target.value) })}
                    className="input-modern"
                  >
                    <option value={15}>15 dakika</option>
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Seviye</label>
                  <select
                    value={programForm.difficulty}
                    onChange={(e) => setProgramForm({ ...programForm, difficulty: e.target.value })}
                    className="input-modern"
                  >
                    <option value="beginner">Başlangıç</option>
                    <option value="intermediate">Orta</option>
                    <option value="advanced">İleri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tercihler (Opsiyonel)</label>
                  <textarea
                    value={programForm.preferences}
                    onChange={(e) => setProgramForm({ ...programForm, preferences: e.target.value })}
                    placeholder="Örn: Sırt ağrım var, esnekliğimi artırmak istiyorum..."
                    className="input-modern resize-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingProgram}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {generatingProgram ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Oluşturuluyor...
                    </span>
                  ) : (
                    'Program Oluştur'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- TRACKER PAGE ---

export default YogaPage;
