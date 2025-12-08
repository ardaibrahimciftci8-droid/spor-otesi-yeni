import React, { useState } from "react";
import { Camera, Smartphone, Send } from "lucide-react";
import api from "../api";
import AICoach from "../components/common/AICoach";

const AnalysisPage = ({ user, setPage }) => {
  const [takim1, setTakim1] = useState("");
  const [takim2, setTakim2] = useState("");
  const [analiz, setAnaliz] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!takim1 || !takim2) return;
    setLoading(true);
    try {
      const text = await askGemini(`Futbol analisti gibi davran. ${takim1} vs ${takim2} maçı için taktiksel analiz ve skor tahmini yap. Türkçe.`);
      setAnaliz(text || "Hata");
    } catch (e) { setAnaliz("Hata: " + e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"><ChevronLeft size={20} /> Ana Sayfa</button>
        
        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="match_analysis"
            title="Maç Analizi Koçu"
            icon={Trophy}
            color="text-blue-500"
            placeholder="Maç taktikleri ve analiz hakkında soru sorun..."
          />
        </div>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><BrainCircuit size={32} className="text-purple-500" /></div>
            <h1 className="text-3xl font-bold text-white">AI Maç Analisti</h1>
          </div>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={takim1} onChange={e=>setTakim1(e.target.value)} placeholder="Ev Sahibi" className="input-modern" required />
              <input type="text" value={takim2} onChange={e=>setTakim2(e.target.value)} placeholder="Deplasman" className="input-modern" required />
            </div>
            <button disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50">{loading ? 'Analiz...' : <><BrainCircuit className="inline mr-2" /> Analiz Et</>}</button>
          </form>
          {analiz && <div className="mt-8 glass-card p-6 whitespace-pre-line text-gray-300">{analiz}</div>}
        </div>
        <div className="mt-8"><AdBanner /></div>
      </div>
    </div>
  );
};

// --- FOOTER ---
// --- MAIN APP ---

export default AnalysisPage;
