import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, ChevronLeft } from "lucide-react";
import api from "../api";

const MessagesPage = ({ user, setPage }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getConversations(user.uid);
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error('Konuşmalar yüklenemedi:', e);
      setError('Mesajlar yüklenemedi');
      setConversations([]);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) loadConversations(); }, [user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openConversation = async (conv) => {
    if (!conv?.id) return;
    setActiveConversation(conv);
    try {
      const data = await api.getMessages(conv.id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error('Mesajlar yüklenemedi:', e);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversation) return;
    const msgText = newMessage;
    setNewMessage('');
    const tempMsg = { id: Date.now().toString(), sender_id: user.uid, sender_name: user?.displayName || 'Kullanıcı', content: msgText, created_at: new Date().toISOString() };
    setMessages([...messages, tempMsg]);
    try {
      await api.sendMessage({ conversation_id: activeConversation.id, sender_id: user.uid, sender_name: user?.displayName || 'Kullanıcı', sender_photo: user?.photoURL || '', content: msgText });
      loadConversations();
    } catch (e) { console.error('Mesaj gönderilemedi:', e); }
  };

  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !Array.isArray(conv.participants) || !user) {
      return { name: 'Kullanıcı', photo: '' };
    }
    const idx = conv.participants.findIndex(p => p !== user.uid);
    return { 
      name: conv.participant_names?.[idx] || 'Kullanıcı', 
      photo: conv.participant_photos?.[idx] || '' 
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <MessageCircle size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <button onClick={() => setPage('login')} className="btn-primary mt-4">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-24">
      <div className="animated-bg" />
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] flex glass-card overflow-hidden mx-4">
        {/* Conversations */}
        <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-white/10`}>
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Mesajlar</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-3">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
                <button onClick={loadConversations} className="btn-primary mt-3 text-sm">Tekrar Dene</button>
              </div>
            ) : conversations?.length > 0 ? conversations.map(conv => {
              if (!conv?.id) return null;
              const other = getOtherParticipant(conv);
              return (
                <button key={conv.id} onClick={() => openConversation(conv)} className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition border-b border-white/5 ${activeConversation?.id === conv.id ? 'bg-white/5' : ''}`}>
                  <img src={other?.photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-white">{other?.name || 'Kullanıcı'}</h4>
                    <p className="text-sm text-gray-500 truncate">{conv?.last_message || 'Henüz mesaj yok'}</p>
                  </div>
                </button>
              );
            }) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Henüz sohbet yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-white/5 rounded-lg"><ChevronLeft size={20} /></button>
              <img src={getOtherParticipant(activeConversation).photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'} alt="" className="w-10 h-10 rounded-xl" />
              <h3 className="font-bold text-white">{getOtherParticipant(activeConversation).name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.length > 0 ? messages.map((msg, idx) => {
                if (!msg) return null;
                return (
                  <div key={msg?.id || idx} className={`flex ${msg?.sender_id === user?.uid ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 ${msg?.sender_id === user?.uid ? 'message-sent' : 'message-received'}`}>
                      <p className="text-sm">{msg?.content || ''}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Mesaj yok</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 input-modern" />
              <button type="submit" disabled={!newMessage.trim()} className="btn-primary px-4 disabled:opacity-50"><Send size={20} /></button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p>Sohbet seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PROFILE PAGE ---

export default MessagesPage;
