import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, ChevronLeft } from 'lucide-react';
import api from '../../api';

const AICoach = ({ user, coachType, title, icon: Icon, color, placeholder }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && showChat) {
      loadHistory();
    }
  }, [user, showChat, coachType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const loadHistory = async () => {
    // 🎯 SUNUM MODU: Backend API bypass - Demo chat history
    // try {
    //   const history = await api.getCoachHistory(user.uid, coachType);
    //   setChatHistory(history);
    // } catch (e) {
    //   console.error(e);
    // }
    
    // Demo chat history - Sunum için
    const demoHistory = [
      {
        user_message: "Merhaba! Kilo verme hedefim var.",
        coach_response: "Merhaba! 👋 Seni tanımak güzel. Kilo verme hedefin için sana özel bir plan hazırlayabilirim. Şu an kaç kilo ve hedef kilon nedir?",
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 saat önce
      }
    ];
    setChatHistory(demoHistory);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const userMsg = message;
    setMessage('');
    setLoading(true);

    // 🎯 SUNUM MODU: Backend API bypass - Simülasyon cevabı
    // try {
    //   const response = await api.coachChat(user.uid, coachType, userMsg);
    //   const newChat = { user_message: userMsg, coach_response: response.response, created_at: new Date().toISOString() };
    //   setChatHistory([newChat, ...chatHistory]);
    // } catch (e) {
    //   console.error(e);
    // }

    // Fake AI Response - Kullanıcı mesajına göre değişken cevaplar
    setTimeout(() => {
      let fakeResponse = "";
      const msgLower = userMsg.toLowerCase();
      
      // Mesaja göre akıllı cevaplar
      if (msgLower.includes('kilo') && (msgLower.includes('ver') || msgLower.includes('zayıfla'))) {
        fakeResponse = "🎯 Kilo verme hedefin için süper bir plan hazırladım!\n\n💪 Haftalık Program:\n• Pazartesi-Çarşamba-Cuma: Kardiyo (30-45 dk)\n• Salı-Perşembe: Kuvvet antrenmanı\n• Haftalık kalori açığı: 500 kcal\n\n🥗 Beslenme:\n• Günde 2000-2200 kalori\n• Yüksek protein (1.8g/kg)\n• Bol sebze ve meyve\n\nİlk 2 hafta sonunda 2-3 kg verebilirsin! Başlamaya hazır mısın? 💚";
      } else if (msgLower.includes('kas') && msgLower.includes('yap')) {
        fakeResponse = "💪 Kas yapma hedefin için harika bir program!\n\n🔥 Hipertrofi Programı:\n• Haftada 4-5 antrenman\n• Her kas grubuna haftada 2 kez\n• 8-12 tekrar aralığı\n• Kompound hareketler: Squat, Deadlift, Bench Press\n\n🍗 Beslenme:\n• Kalori fazlası: +300-500 kcal\n• Protein: 2g/kg\n• Karbonhidrat bolca (antrenman öncesi/sonrası)\n\n3 ayda 3-5 kg kas yapabilirsin! Disiplinle devam! 🚀";
      } else if (msgLower.includes('koş') || msgLower.includes('kardiyo')) {
        fakeResponse = "🏃‍♂️ Koşu ve kardiyo için mükemmel bir plan!\n\n📅 12 Haftalık Program:\n• Hafta 1-4: 3-4 km (haftada 3 gün)\n• Hafta 5-8: 5-7 km (haftada 4 gün)\n• Hafta 9-12: 8-10 km (haftada 5 gün)\n\n⏱️ Tempo:\n• İlk 2 ay: Rahat tempoda (konuşabilecek hızda)\n• Son ay: Interval training ekle\n\n💡 İpucu: İyi koşu ayakkabısı al ve ısınmayı unutma! Hazır mısın? 🔥";
      } else if (msgLower.includes('yoga') || msgLower.includes('esneklik') || msgLower.includes('meditasyon')) {
        fakeResponse = "🧘‍♀️ Yoga ve meditasyon için harika bir başlangıç!\n\n🌅 Günlük Rutin:\n• Sabah: 15 dakika güneş selamı\n• Öğle: 10 dakika nefes egzersizi\n• Akşam: 20 dakika yin yoga + meditasyon\n\n✨ Faydalar:\n• Esneklik artışı (4-6 hafta)\n• Stres azalması (2 hafta)\n• Daha iyi uyku kalitesi\n\nYouTube'dan Yoga with Adriene kanalını öneriyorum! Başlayalım mı? 🙏";
      } else if (msgLower.includes('diyet') || msgLower.includes('beslenme') || msgLower.includes('yemek')) {
        fakeResponse = "🥗 Sağlıklı beslenme planı hazır!\n\n🍽️ Örnek Günlük Menü:\n• Sabah: Yumurta (2 adet) + kepekli ekmek + domates\n• Ara: Meyve + 10 adet badem\n• Öğle: Izgara tavuk (150g) + bulgur pilavı + salata\n• Ara: Yoğurt + 1 muz\n• Akşam: Izgara balık + zeytinyağlı sebze\n\n💧 Su: Günde 2.5-3 litre\n🚫 Kaçın: Şeker, fast food, işlenmiş gıda\n\nBaşarıya giden yol mutfaktan geçer! 🌟";
      } else if (msgLower.includes('motivasyon') || msgLower.includes('başla') || msgLower.includes('nasıl')) {
        fakeResponse = "🔥 Motivasyon için en iyi tavsiyelerim!\n\n💡 Başarı İpuçları:\n1. Küçük hedefler koy (haftalık)\n2. İlerlemeyi takip et (fotoğraf çek)\n3. Bir arkadaşla birlikte çalış\n4. Kendini ödüllendir\n5. Kötü günler olacak, önemli değil!\n\n📈 Hatırla:\n• İlk 21 gün en zor\n• 3 ay sonra alışkanlık olur\n• 6 ay sonra yaşam tarzı olur\n\nSen yapabilirsin! Ben buradayım! 💪✨";
      } else {
        // Genel cevap
        fakeResponse = "Harika bir soru! 🎯 Senin için özel bir plan hazırlayabilirim.\n\n💪 Önerilerim:\n• Haftada 3-4 antrenman yap\n• Beslenmeye dikkat et\n• Düzenli uyku (7-8 saat)\n• Bol su iç (2.5-3 litre)\n\nDaha detaylı bilgi için bana şunları sor:\n• Kilo verme\n• Kas yapma\n• Koşu/Kardiyo\n• Yoga/Esneklik\n• Beslenme planı\n\nHangi konuda yardımcı olabilirim? 😊";
      }
      
      const newChat = { 
        user_message: userMsg, 
        coach_response: fakeResponse, 
        created_at: new Date().toISOString() 
      };
      
      setChatHistory([newChat, ...chatHistory]);
      setLoading(false);
      
      // Auto-speak response if TTS is available
      if (window.speakResponse && 'speechSynthesis' in window) {
        handleSpeak(fakeResponse);
      }
    }, 1500); // 1.5 saniye bekleme - Gerçekçi görünsün
  };

  const handleSpeak = async (text) => {
    try {
      setSpeaking(true);
      // Use Web Speech API (browser native)
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech error:', e);
      setSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-card p-6 text-center">
        <Icon size={48} className={`mx-auto mb-4 ${color}`} />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">Koç ile konuşmak için giriş yapmalısınız</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color}/20 flex items-center justify-center`}>
            <Icon size={28} className={color} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{placeholder}</p>
          </div>
        </div>
        <ChevronLeft size={24} className={`text-gray-400 transition-transform ${showChat ? 'rotate-90' : '-rotate-90'}`} />
      </button>

      {showChat && (
        <div className="border-t border-white/10">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {chatHistory.length > 0 ? (
              chatHistory.slice().reverse().map((chat, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] message-sent">
                      <p className="text-sm">{chat.user_message}</p>
                    </div>
                  </div>
                  <div className="flex justify-start gap-2 items-start">
                    <div className="max-w-[80%] message-received">
                      <p className="text-sm whitespace-pre-line">{chat.coach_response}</p>
                    </div>
                    <button
                      onClick={() => handleSpeak(chat.coach_response)}
                      disabled={speaking}
                      className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white disabled:opacity-50"
                      title="Sesli dinle"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Icon size={48} className={`mx-auto mb-4 opacity-50 ${color}`} />
                <p>Koça ilk sorunuzu sorun!</p>
              </div>
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="message-received">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              className="flex-1 input-modern"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AICoach;
