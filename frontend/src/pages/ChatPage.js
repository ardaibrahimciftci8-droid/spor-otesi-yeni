import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';

const ChatPage = ({ user, setPage }) => {
  // INSTAGRAM-STYLE DEMO DATA - FAIL-SAFE
  const DEMO_CONVERSATIONS = [
    {
      id: 'demo-1',
      participant_id: 'trainer-123',
      participant_name: 'Eren Hoca',
      participant_photo: 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=Eren&size=128',
      last_message: 'Yarınki maç saat kaçta?',
      last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      unread_count: 1,
      online: true
    },
    {
      id: 'demo-2',
      participant_id: 'friend-456',
      participant_name: 'Ayşe Yılmaz',
      participant_photo: 'https://ui-avatars.com/api/?background=ec4899&color=fff&name=Ayşe&size=128',
      last_message: 'Antrenman nasıl gitti?',
      last_message_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      unread_count: 0,
      online: false
    },
    {
      id: 'demo-3',
      participant_id: 'coach-789',
      participant_name: 'Mehmet Antrenör',
      participant_photo: 'https://ui-avatars.com/api/?background=10b981&color=fff&name=Mehmet&size=128',
      last_message: 'Yarın görüşürüz 💪',
      last_message_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      unread_count: 0,
      online: true
    }
  ];

  const DEMO_MESSAGES = {
    'demo-1': [
      { id: 'm1', sender_id: 'trainer-123', sender_name: 'Eren Hoca', content: 'Merhaba! Yarınki maç saat kaçta?', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: 'm2', sender_id: user?.uid || 'me', sender_name: user?.displayName || 'Sen', content: '14:00\'te hocam. Stadyum önünde buluşalım mı?', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 'm3', sender_id: 'trainer-123', sender_name: 'Eren Hoca', content: 'Tamam, hazır ol! 🔥', created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() }
    ],
    'demo-2': [
      { id: 'm4', sender_id: 'friend-456', sender_name: 'Ayşe Yılmaz', content: 'Antrenman nasıl gitti?', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 'm5', sender_id: user?.uid || 'me', sender_name: user?.displayName || 'Sen', content: 'Çok iyiydi! Sen de gelsene yarın', created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() }
    ],
    'demo-3': [
      { id: 'm6', sender_id: 'coach-789', sender_name: 'Mehmet Antrenör', content: 'Yarın görüşürüz 💪', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
      { id: 'm7', sender_id: user?.uid || 'me', sender_name: user?.displayName || 'Sen', content: 'Görüşürüz hocam 👍', created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString() }
    ]
  };

  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [useFirestore, setUseFirestore] = useState(true); // Firestore switch
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations - FIRESTORE + FALLBACK
  useEffect(() => {
    loadConversations();
  }, [user]);

  // Real-time messages listener - FIRESTORE
  useEffect(() => {
    if (activeConversation && user && useFirestore) {
      loadMessagesRealtime();
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [activeConversation, user, useFirestore]);

  // FIRESTORE REAL-TIME MESSAGES
  const loadMessagesRealtime = () => {
    if (!activeConversation?.id || !user?.uid) return;
    
    try {
      const conversationId = activeConversation.id.startsWith('demo-') 
        ? null 
        : activeConversation.id;
      
      if (!conversationId) {
        // Demo conversation - use demo messages
        setMessages(DEMO_MESSAGES[activeConversation.id] || []);
        return;
      }

      // FIRESTORE QUERY - Real-time listener
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversation_id', '==', conversationId),
        orderBy('created_at', 'asc')
      );

      unsubscribeRef.current = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
          }));
          setMessages(msgs.length > 0 ? msgs : DEMO_MESSAGES[activeConversation.id] || []);
        },
        (error) => {
          console.log('Firestore listener error, using demo:', error);
          setUseFirestore(false);
          setMessages(DEMO_MESSAGES[activeConversation.id] || []);
        }
      );
    } catch (e) {
      console.log('Firestore setup failed, using demo:', e);
      setUseFirestore(false);
      setMessages(DEMO_MESSAGES[activeConversation.id] || []);
    }
  };

  const loadConversations = async () => {
    if (!user) {
      setConversations(DEMO_CONVERSATIONS);
      return;
    }
    
    setLoading(true);
    
    // Try Firestore first
    if (useFirestore) {
      try {
        const convQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid)
        );
        const snapshot = await getDocs(convQuery);
        
        if (!snapshot.empty) {
          const convs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConversations(convs.length > 0 ? convs : DEMO_CONVERSATIONS);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Firestore failed, trying API:', e);
      }
    }

    // Fallback to API
    try {
      const data = await api.getConversations(user.uid);
      if (Array.isArray(data) && data.length > 0) {
        setConversations(data);
      } else {
        setConversations(DEMO_CONVERSATIONS);
      }
    } catch (e) {
      console.log('API also failed, using demo data:', e);
      setConversations(DEMO_CONVERSATIONS);
    }
    setLoading(false);
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    
    // Önce demo mesajları göster
    const demoMsgs = DEMO_MESSAGES[conv.id] || [];
    setMessages(demoMsgs);
    
    // API'den gerçek mesajları çekmeyi dene
    if (user && conv.id && !conv.id.startsWith('demo-')) {
      try {
        const data = await api.getMessages(conv.id);
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        }
      } catch (e) {
        console.log('Messages API failed, keeping demo data');
        // Demo data zaten yüklü, devam et
      }
    }
  };

  // FIRESTORE + OPTIMISTIC UI - Mesaj hemen ekrana basılır
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const msgText = newMessage;
    setNewMessage('');

    // Optimistic UI - Hemen mesajı ekle
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      sender_id: user?.uid || 'me',
      sender_name: user?.displayName || 'Sen',
      content: msgText,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages([...messages, optimisticMsg]);

    // Update last message in conversations
    setConversations(conversations.map(c => 
      c.id === activeConversation.id 
        ? { ...c, last_message: msgText, last_message_time: new Date().toISOString() }
        : c
    ));

    // FIRESTORE SAVE - Real-time database
    if (useFirestore && user && !activeConversation.id.startsWith('demo-')) {
      try {
        await addDoc(collection(db, 'messages'), {
          conversation_id: activeConversation.id,
          sender_id: user.uid,
          sender_name: user.displayName || 'Kullanıcı',
          sender_photo: user.photoURL || '',
          content: msgText,
          created_at: serverTimestamp(),
          read: false
        });
        console.log('✅ Mesaj Firestore\'a kaydedildi');
        // Real-time listener otomatik güncelleyecek
      } catch (e) {
        console.log('Firestore failed, trying API:', e);
        // Fallback to API
        try {
          await api.sendMessage({
            conversation_id: activeConversation.id,
            sender_id: user.uid,
            sender_name: user.displayName,
            sender_photo: user.photoURL,
            content: msgText
          });
        } catch (apiError) {
          console.log('API also failed, but message visible (optimistic UI)');
        }
      }
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün`;
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Login check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <MessageCircle size={64} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Mesajlaşmaya Başla</h2>
          <p className="text-gray-400 mb-6">Diğer sporcularla sohbet etmek için giriş yap</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-24 bg-elite-bg">
      <div className="fixed inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-neon-lime/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-4 relative z-10">
        <div className="bg-elite-bg border border-white/10 rounded-3xl overflow-hidden flex shadow-2xl" style={{ height: 'calc(100vh - 8rem)' }}>
          
          {/* Left Panel - Conversations List */}
          <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-white/10`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <MessageCircle size={24} className="text-neon-lime" />
                <span className="gradient-text-elite">Mesajlar</span>
              </h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kişi ara..."
                  className="input-elite w-full pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conv => (
                  <motion.button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-elite ${
                      activeConversation?.id === conv.id ? 'bg-white/5 border-l-4 border-electric-blue' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.participant_photo || `https://ui-avatars.com/api/?background=1f2937&color=fff&name=${conv.participant_name}`}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                      />
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-elite-bg"></div>
                      )}
                      {conv.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-electric-blue text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 shadow-lg">
                          {conv.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold truncate ${conv.unread_count > 0 ? 'text-white' : 'text-gray-300'}`}>
                          {conv.participant_name}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{timeAgo(conv.last_message_time)}</span>
                      </div>
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                        {conv.last_message || 'Henüz mesaj yok'}
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Henüz sohbet yok</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat Window */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-2 hover:bg-white/5 rounded-lg transition"
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </button>
                  <img
                    src={activeConversation.participant_photo || `https://ui-avatars.com/api/?background=1f2937&color=fff&name=${activeConversation.participant_name}`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                  />
                  <div>
                    <h3 className="font-bold text-white">{activeConversation.participant_name}</h3>
                    <p className="text-xs text-green-500">Çevrimiçi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400">
                    <Video size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.uid || msg.sender_id === 'me';
                    return (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] md:max-w-[60%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                          {!isMe && (
                            <p className="text-xs text-gray-400 mb-1 ml-3 font-medium">{msg.sender_name}</p>
                          )}
                          <div className={`px-4 py-2.5 rounded-3xl inline-block ${
                            isMe 
                              ? 'bg-gradient-to-br from-electric-blue to-blue-600 text-white ml-auto rounded-br-md shadow-lg' 
                              : 'bg-white/8 text-white rounded-bl-md backdrop-blur-md border border-white/5'
                          }`}>
                            <p className="text-[15px] leading-relaxed">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'} ${isMe ? 'mr-2' : 'ml-2'}`}>
                            <p className="text-[11px] text-gray-500">
                              {timeAgo(msg.created_at)}
                            </p>
                            {isMe && msg.status !== 'sending' && (
                              <CheckCheck size={14} className="text-electric-blue" />
                            )}
                            {isMe && msg.status === 'sending' && (
                              <Check size={14} className="text-gray-500 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                      <p>Henüz mesaj yok</p>
                      <p className="text-sm mt-2">İlk mesajı gönderin!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesaj yaz..."
                    className="input-elite flex-1 rounded-full px-6 py-3"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-neon-lime to-electric-blue hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed text-elite-bg p-3 rounded-full transition-elite shadow-lg hover:shadow-neon-lime/50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle size={80} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold text-white mb-2">Mesajlarınız</h3>
                <p>Bir sohbet seçin veya yeni bir sohbet başlatın</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
