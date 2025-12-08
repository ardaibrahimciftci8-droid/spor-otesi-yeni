import React, { useState, useEffect } from "react";
import { Utensils, ChefHat, PlusCircle, X, Coffee, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

const NutritionPage = ({ user, setPage }) => {
  const [activeTab, setActiveTab] = useState("hesapla");
  const [val, setVal] = useState({ kilo: "", boy: "", yas: "", cinsiyet: "erkek", aktivite: "1.2" });
  const [bmrResult, setBmrResult] = useState(null);
  const [mealInput, setMealInput] = useState("");
  const [mealAnalysis, setMealAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);

  const handlePhotoAnalysis = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
        
        // Call Vision API
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCX9mTodIiwsWk0-_ux1AYgMbniUcqgAuo`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { content: base64Image.split(',')[1] },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 10 },
                  { type: 'TEXT_DETECTION' }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        const labels = data.responses[0]?.labelAnnotations || [];
        
        // Filter food-related labels
        const foodLabels = labels.filter(l => 
          ['food', 'dish', 'cuisine', 'meal', 'fruit', 'vegetable', 'meat', 'bread', 'rice', 'pasta', 'salad', 'drink', 'yemek', 'meyve', 'sebze'].some(
            keyword => l.description.toLowerCase().includes(keyword)
          )
        ).slice(0, 5);

        if (foodLabels.length > 0) {
          const foodItems = foodLabels.map(l => l.description).join(', ');
          
          // Get AI analysis
          const aiResult = await askGemini(
            `Fotoğrafta tespit edilen yiyecekler: ${foodItems}. Bunlar için tahmini kalori, protein, karbonhidrat ve yağ değerlerini ver. Ayrıca sağlık önerisi yap. Türkçe.`
          );
          
          setPhotoAnalysis({
            foodItems: foodLabels.map(l => l.description),
            analysis: aiResult
          });
        } else {
          alert('❌ Fotoğrafta yiyecek tespit edilemedi. Lütfen daha net bir fotoğraf deneyin.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo analysis error:', error);
      alert('❌ Fotoğraf analizi başarısız.');
    }
    setAnalyzingPhoto(false);
  };

  const hesaplaBMR = (e) => {
    e.preventDefault();
    let bmr = val.cinsiyet === "erkek" ? (10 * Number(val.kilo)) + (6.25 * Number(val.boy)) - (5 * Number(val.yas)) + 5 : (10 * Number(val.kilo)) + (6.25 * Number(val.boy)) - (5 * Number(val.yas)) - 161;
    setBmrResult(Math.round(bmr * Number(val.aktivite)));
  };

  const analizEt = async (e) => {
    e.preventDefault();
    if (!mealInput) return;
    setLoading(true);
    try {
      const res = await askGemini(`Diyetisyen gibi davran. Şu öğünü analiz et: "${mealInput}". Toplam Kalori, Makro Besinler ve sağlık yorumu yap. Türkçe.`);
      setMealAnalysis(res || "Hata");
    } catch (e) { setMealAnalysis("Analiz yapılamadı."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setPage('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"><ChevronLeft size={20} /> Ana Sayfa</button>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4"><Flame className="inline mr-2 text-orange-500" />AI Beslenme Uzmanı</h1>
          <p className="text-gray-400">Kalori hesapla veya yediğini analiz et</p>
        </div>
        {/* AI Coach */}
        <div className="mb-8">
          <AICoach
            user={user}
            coachType="nutrition"
            title="Beslenme Koçu"
            icon={Utensils}
            color="text-orange-500"
            placeholder="Beslenme ve diyet hakkında soru sorun..."
          />
        </div>

        {/* Photo Analysis Button */}
        <div className="mb-6">
          <label className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all cursor-pointer">
            {analyzingPhoto ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Fotoğraf analiz ediliyor...
              </>
            ) : (
              <>
                <Camera size={20} />
                Yemek Fotoğrafı Analiz Et
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoAnalysis}
              className="hidden"
              disabled={analyzingPhoto}
            />
          </label>
        </div>

        {/* Photo Analysis Result */}
        {photoAnalysis && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Camera size={20} className="text-purple-500" />
              Fotoğraf Analizi
            </h3>
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Tespit edilen yiyecekler:</p>
              <div className="flex flex-wrap gap-2">
                {photoAnalysis.foodItems.map((food, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-gray-300 whitespace-pre-line">{photoAnalysis.analysis}</div>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setActiveTab("hesapla")} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === "hesapla" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "bg-white/5 text-gray-400"}`}>İhtiyaç Hesapla</button>
          <button onClick={() => setActiveTab("analiz")} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === "analiz" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "bg-white/5 text-gray-400"}`}><Utensils size={18} /> Analiz Et</button>
        </div>
        <div className="glass-card p-8">
          {activeTab === "hesapla" ? (
            <form onSubmit={hesaplaBMR} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">Kilo (kg)</label><input type="number" value={val.kilo} onChange={e=>setVal({...val, kilo:e.target.value})} className="input-modern" required/></div>
                <div><label className="block text-sm text-gray-400 mb-2">Boy (cm)</label><input type="number" value={val.boy} onChange={e=>setVal({...val, boy:e.target.value})} className="input-modern" required/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">Yaş</label><input type="number" value={val.yas} onChange={e=>setVal({...val, yas:e.target.value})} className="input-modern" required/></div>
                <div><label className="block text-sm text-gray-400 mb-2">Cinsiyet</label><select value={val.cinsiyet} onChange={e=>setVal({...val, cinsiyet:e.target.value})} className="input-modern"><option value="erkek">Erkek</option><option value="kadin">Kadın</option></select></div>
              </div>
              <div><label className="block text-sm text-gray-400 mb-2">Aktivite</label><select value={val.aktivite} onChange={e=>setVal({...val, aktivite:e.target.value})} className="input-modern"><option value="1.2">Hareketsiz</option><option value="1.375">Az Hareketli</option><option value="1.55">Orta</option><option value="1.725">Çok Hareketli</option></select></div>
              <button className="w-full btn-primary">HESAPLA</button>
              {bmrResult && <div className="mt-6 text-center glass-card p-6"><p className="text-gray-400 mb-2">Günlük İhtiyacın</p><p className="text-4xl font-black gradient-text">{bmrResult} kcal</p></div>}
            </form>
          ) : (
            <div className="space-y-6">
              <textarea value={mealInput} onChange={(e) => setMealInput(e.target.value)} placeholder="Örn: Sabah 2 yumurta, 5 zeytin, 1 dilim peynir..." className="input-modern h-32 resize-none" />
              <button onClick={analizEt} disabled={loading} className="w-full btn-primary disabled:opacity-50">{loading ? "Hesaplanıyor..." : <><ChefHat className="inline mr-2" /> Analiz Et</>}</button>
              {mealAnalysis && <div className="glass-card p-6 whitespace-pre-line text-gray-300">{mealAnalysis}</div>}
            </div>
          )}
        </div>
        <div className="mt-8"><AdBanner /></div>
      </div>
    </div>
  );
};

// --- ANALYSIS PAGE ---

export default NutritionPage;
