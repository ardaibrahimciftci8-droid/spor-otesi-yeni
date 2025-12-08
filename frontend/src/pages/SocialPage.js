import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Search, Home, Video, Image, Users, 
  Plus, Send, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import api from '../api';
import { auth } from '../firebase';
import StoryViewer from '../components/common/StoryViewer';
import ReelsViewer from '../components/common/ReelsViewer';
import PostCard from '../components/social/PostCard';
import CreatePostModal from '../components/social/CreatePostModal';
import CreateReelModal from '../components/social/CreateReelModal';
import UserProfileModal from '../components/common/UserProfileModal';

const SocialPage = ({ user, setPage, onViewProfile }) => {
  // DEMO DATA - API fail olsa bile gösterilecek
  const DEMO_POSTS = [
    {
      id: 'demo-1',
      user_id: 'demo',
      user_name: 'Demo Kullanıcı',
      user_photo: 'https://ui-avatars.com/api/?background=f59e0b&color=fff&name=Demo',
      content: 'Bugün harika bir antrenman yaptım! 💪🏃‍♂️ (Demo Gönderi)',
      media_url: 'https://picsum.photos/600/400?random=demo',
      media_type: 'image',
      likes_count: 42,
      comments_count: 8,
      created_at: new Date().toISOString()
    }
  ];

  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Stories state
  const [stories, setStories] = useState([]);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Reels state
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [showCreateReel, setShowCreateReel] = useState(false);
  
  // Messaging state
  const [showMessages, setShowMessages] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const loadPosts = async () => {
    // 🎯 SUNUM MODU: Demo data direkt yükle, API'yi atla
    setLoading(true);
    setTimeout(() => {
      setPosts(DEMO_POSTS);
      setLoading(false);
    }, 500);
  };

  const loadStories = async () => {
    // 🎯 SUNUM MODU: Boş hikaye listesi (veya demo eklenebilir)
    setStories([]);
  };

  const handleCreateStory = async () => {
    if (!user) {
      alert('Hikaye paylaşmak için giriş yapmalısınız');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const uploadRes = await api.uploadImage(file);
        const storyData = {
          user_id: user.uid,
          user_name: user.displayName,
          user_photo: user.photoURL,
          media_url: uploadRes.secure_url,
          media_type: file.type.startsWith('video') ? 'video' : 'image',
          duration: file.type.startsWith('video') ? 15 : 5
        };
        await api.createStory(storyData);
        await loadStories();
        alert('✅ Hikaye paylaşıldı!');
      } catch (e) {
        console.error(e);
        alert('❌ Hikaye paylaşılamadı');
      }
    };
    input.click();
  };

  const loadConversations = async () => {
    if (!user) return;
    try {
      const data = await api.getConversations(user.uid);
      setConversations(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadPosts(); }, [user]);
  useEffect(() => { if (user && showMessages) loadConversations(); }, [user, showMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const results = await api.searchUsers(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } catch (e) { console.error(e); }
  };

  // Real-time search as user types
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const results = await api.searchUsers(searchQuery);
          setSearchResults(results);
          setShowSearch(true);
        } catch (e) {
          console.error('Search error:', e);
        }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  useEffect(() => {
    loadPosts();
    loadStories();
    if (user) loadConversations();
  }, [user]);

  const startChatWithUser = async (profile) => {
    if (!user) return;
    try {
      const conv = await api.getOrCreateConversation(
        user.uid,
        user.displayName,
        user.photoURL,
        profile.firebase_uid,
        profile.display_name,
        profile.photo_url
      );
      setActiveConversation(conv);
      setShowMessages(true);
      await loadMessages(conv.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deletePost(postId, user.uid);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) { console.error(e); }
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const data = await api.getMessages(conv.id);
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgText = newMessage;
    setNewMessage('');
    const tempMsg = { id: Date.now().toString(), sender_id: user.uid, sender_name: user.displayName, content: msgText, created_at: new Date().toISOString() };
    setMessages([...messages, tempMsg]);
    try {
      await api.sendMessage({ conversation_id: activeConversation.id, sender_id: user.uid, sender_name: user.displayName, sender_photo: user.photoURL, content: msgText });
      loadConversations();
    } catch (e) { console.error(e); }
  };

  const getOtherParticipant = (conv) => {
    const idx = conv.participants.findIndex(p => p !== user.uid);
    return { name: conv.participant_names[idx] || 'Kullanıcı', photo: conv.participant_photos[idx] || '' };
  };

  // Load reels from API
  useEffect(() => {
    if (activeTab === 'reels') {
      loadReels();
    }
  }, [activeTab]);

  const loadReels = async () => {
    try {
      const data = await api.getReelsFeed(user?.uid, 20);
      if (data && data.length > 0) {
        setReels(data);
      } else {
        // If no reels in DB, use mock data
        setReels([
          {
            id: '1',
            user_id: 'user1',
            user_name: 'Ahmet Yılmaz',
            user_photo: '',
            video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            description: 'Sabah koşusu 🏃‍♂️💪 #fitness #motivation',
            music: 'Original Audio - Ahmet',
            likes_count: 234,
            comments_count: 12,
            likes: []
          },
          {
            id: '2',
            user_id: 'user2',
            user_name: 'Ayşe Demir',
            user_photo: '',
            video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            description: 'Yoga akış 🧘‍♀️✨ Huzur dolu bir gün',
            music: 'Relaxing Music',
            likes_count: 512,
            comments_count: 28,
            likes: []
          }
        ]);
      }
    } catch (e) {
      console.error('Reels yükleme hatası:', e);
    }
  };

  const handleLikeReel = async (reelId) => {
    if (!user) return;
    try {
      const result = await api.likeReel(reelId, user.uid);
      // Update local state
      setReels(reels.map(reel => 
        reel.id === reelId 
          ? { ...reel, likes_count: result.likes_count, likes: result.liked ? [...(reel.likes || []), user.uid] : (reel.likes || []).filter(id => id !== user.uid) }
          : reel
      ));
    } catch (e) {
      console.error('Beğeni hatası:', e);
    }
  };

  const handleCommentOnReel = async (reelId, text) => {
    if (!user || !text.trim()) return;
    try {
      await api.commentOnReel(reelId, {
        user_id: user.uid,
        user_name: user.displayName || 'Kullanıcı',
        user_photo: user.photoURL || '',
        content: text
      });
      // Update comments count
      setReels(reels.map(reel => 
        reel.id === reelId 
          ? { ...reel, comments_count: (reel.comments_count || 0) + 1 }
          : reel
      ));
    } catch (e) {
      console.error('Yorum hatası:', e);
    }
  };

  const handleProfilePhotoUpload = async (file) => {
    if (!file) return;
    
    // Base64'e çevir ve LocalStorage'a kaydet - KALICI ÇÖZÜM!
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreviewPhoto(base64String);
      // LocalStorage'a kaydet - Sayfa yenilense bile kalır!
      localStorage.setItem('profileImage', base64String);
      console.log('✅ Profil resmi tarayıcıya kaydedildi (kalıcı)');
    };
    reader.readAsDataURL(file);
    
    // Arka planda sunucuya da yükle (opsiyonel)
    try {
      const uploadRes = await api.uploadImage(file);
      await api.updateUser(user?.uid, { photo_url: uploadRes.secure_url });
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { photoURL: uploadRes.secure_url });
      }
      
      console.log('✅ Profil resmi sunucuya da yüklendi');
    } catch (e) {
      console.log('Sunucu yüklemesi başarısız (LocalStorage\'da kayıtlı):', e);
      // LocalStorage'da kayıtlı olduğu için sorun yok!
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      
      {/* Reels Full Screen View */}
      {activeTab === 'reels' ? (
        <div className="fixed inset-0 bg-black" style={{ zIndex: 9000 }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('feed');
            }}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white cursor-pointer"
            style={{ zIndex: 9001 }}
          >
            <X size={24} />
          </button>
          {user && (
            <button
              onClick={() => setShowCreateReel(true)}
              className="absolute top-4 right-4 z-50 p-3 bg-gradient-to-r from-red-500 to-pink-500 backdrop-blur-sm rounded-full text-white font-semibold flex items-center gap-2 hover:from-red-600 hover:to-pink-600 transition shadow-lg"
            >
              <Plus size={20} />
              <span className="hidden md:inline">Reel Yükle</span>
            </button>
          )}
          <ReelsViewer
            reels={reels}
            currentIndex={currentReelIndex}
            onIndexChange={setCurrentReelIndex}
            user={user}
            onLike={handleLikeReel}
            onComment={handleCommentOnReel}
          />
        </div>
      ) : (
        <>
          {/* Instagram-style Header */}
          <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent" style={{fontFamily: 'Pacifico, cursive'}}>
                Spor Ötesi
              </h1>
              <div className="flex items-center gap-4">
                {user && (
                  <button onClick={() => setShowMessages(!showMessages)} className="relative p-2 hover:bg-white/10 rounded-lg transition">
                    <MessageCircle size={24} className="text-white" />
                    {conversations.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">{conversations.length}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto flex gap-6 pt-4">
          {/* Main Content - Instagram Feed Style */}
          <div className={`flex-1 max-w-[630px] mx-auto ${showMessages && activeConversation ? 'hidden md:block' : 'block'}`}>
            
            {/* Stories Bar - Instagram Style */}
            <div className="mb-4 glass-card p-4 rounded-xl">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* Create Story Button */}
                {user && (
                  <div onClick={handleCreateStory} className="flex-shrink-0 cursor-pointer group">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                          <Plus className="text-yellow-500" size={24} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center mt-1 text-white truncate w-16">Hikaye</p>
                  </div>
                )}
                
                {/* User Stories */}
                {stories.map((userStory) => (
                  <div 
                    key={userStory.user_id}
                    onClick={() => {
                      setCurrentStoryIndex(stories.indexOf(userStory));
                      setShowStoryViewer(true);
                    }}
                    className="flex-shrink-0 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-[2px] group-hover:scale-105 transition">
                        <img 
                          src={userStory.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=64'}
                          alt={userStory.user_name}
                          className="w-full h-full rounded-full object-cover border-2 border-gray-900"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-center mt-1 text-white truncate w-16">
                      {userStory.user_id === user?.uid ? 'Sen' : userStory.user_name.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs - Modern Style */}
            <div className="flex gap-8 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab('feed')}
                className={`pb-3 font-semibold transition-all relative ${
                  activeTab === 'feed'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Home size={24} className="mx-auto mb-1" />
                {activeTab === 'feed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
              </button>
              <button
                onClick={() => setActiveTab('reels')}
                className={`pb-3 font-semibold transition-all relative ${
                  activeTab === 'reels'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video size={24} className="mx-auto mb-1" />
                {activeTab === 'reels' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
              </button>
              <button onClick={() => setShowSearchModal(true)} className="pb-3 text-gray-400 hover:text-white transition-all">
                <Search size={24} className="mx-auto mb-1" />
              </button>
            </div>

          {/* Search Modal */}
          {showSearchModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
              onClick={() => setShowSearchModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Kullanıcı Ara</h3>
                  <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kullanıcı ara..."
                    className="input-modern pl-12 w-full"
                    autoFocus
                  />
                </div>
                {showSearch && searchResults.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.map(profile => (
                      <div
                        key={profile.id}
                        onClick={() => {
                          setSelectedUserId(profile.firebase_uid);
                          setShowSearchModal(false);
                        }}
                        className="cursor-pointer hover:bg-white/5 p-3 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={profile.photo_url || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'}
                            alt={profile.display_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-white">{profile.display_name}</h4>
                            <p className="text-sm text-gray-400">@{profile.display_name.toLowerCase().replace(/\s/g, '')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery.length > 0 && searchResults.length === 0 && !showSearch && (
                  <p className="text-center text-gray-400 py-4">Kullanıcı bulunamadı</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Create Post - Instagram Style */}
          {user && (
            <div className="space-y-2 mb-4">
              <button onClick={() => setShowCreatePost(true)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition text-left">
                <img src={user.photoURL || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'} alt="" className="w-10 h-10 rounded-full object-cover" />
                <span className="text-gray-400 flex-1">Ne düşünüyorsun?</span>
                <div className="flex gap-2">
                  <Image size={20} className="text-green-500" />
                  <Video size={20} className="text-red-500" />
                </div>
              </button>
              <button onClick={() => setShowCreateReel(true)} className="w-full bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-center gap-2 hover:from-red-500/20 hover:to-pink-500/20 transition">
                <Video size={20} className="text-red-500" />
                <span className="text-white font-semibold">Reel Yükle</span>
              </button>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} user={user} onDelete={handleDeletePost} onViewProfile={onViewProfile} />
              ))
            ) : (
              <div className="text-center py-10 glass-card">
                <Users size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">Henüz paylaşım yok</p>
                {user && (
                  <button onClick={() => setShowCreatePost(true)} className="mt-4 btn-primary">İlk paylaşımı yap!</button>
                )}
              </div>
            )}
          </div>

          {/* Messages Sidebar */}
          {showMessages && user && (
            <div className={`${activeConversation ? 'fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden md:block'} w-full md:w-96 glass-card h-[calc(100vh-8rem)] md:sticky md:top-24`}>
            {!activeConversation ? (
              <>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Mesajlar</h2>
                  <button onClick={() => setShowMessages(false)} className="md:hidden text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                  {conversations.length > 0 ? conversations.map(conv => {
                    const other = getOtherParticipant(conv);
                    return (
                      <button key={conv.id} onClick={() => openConversation(conv)} className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition border-b border-white/5">
                        <img src={other.photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-white">{other.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{conv.last_message || 'Henüz mesaj yok'}</p>
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
              </>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-white/5 rounded-lg">
                    <ChevronLeft size={20} />
                  </button>
                  <img src={getOtherParticipant(activeConversation).photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=40'} alt="" className="w-10 h-10 rounded-xl" />
                  <h3 className="font-bold text-white">{getOtherParticipant(activeConversation).name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex ${msg.sender_id === user.uid ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 ${msg.sender_id === user.uid ? 'message-sent' : 'message-received'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 input-modern" />
                  <button type="submit" disabled={!newMessage.trim()} className="btn-primary px-4 disabled:opacity-50"><Send size={20} /></button>
                </form>
              </div>
            )}
          </div>
          )}
          </div>
        </div>
        </>
      )}

      <AnimatePresence>
        {showStoryViewer && (
          <StoryViewer
            userStories={stories}
            currentUserIndex={currentStoryIndex}
            onClose={() => setShowStoryViewer(false)}
            onViewStory={(storyId) => user && api.viewStory(storyId, user.uid)}
          />
        )}
        {showCreatePost && user && <CreatePostModal user={user} onClose={() => setShowCreatePost(false)} onPostCreated={(p) => setPosts([p, ...posts])} />}
        {showCreateReel && user && <CreateReelModal user={user} onClose={() => setShowCreateReel(false)} onReelCreated={(r) => { setReels([r, ...reels]); setShowCreateReel(false); }} />}
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            currentUser={user}
            onStartChat={startChatWithUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialPage;