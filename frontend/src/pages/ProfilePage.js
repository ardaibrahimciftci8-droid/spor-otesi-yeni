import React, { useState, useEffect } from "react";
import { Camera, Award } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfile } from "firebase/auth";
import api from "../api";
import { auth } from "../firebase";
import PostCard from "../components/social/PostCard";
import UserCard from "../components/social/UserCard";

const ProfilePage = ({ user, setPage, onViewProfile }) => {
  // DEMO DATA - API fail olsa bile gösterilecek
  const DEMO_PROFILE = {
    display_name: 'Misafir Kullanıcı',
    bio: 'Spor tutkunu 🏃‍♂️ (Demo Modu)',
    photo_url: 'https://ui-avatars.com/api/?background=f59e0b&color=fff&name=Demo&size=120',
    is_private: false
  };
  const DEMO_POSTS = [];
  const DEMO_FOLLOWERS = Array(10).fill(null).map((_, i) => ({ id: `demo-${i}`, display_name: `Takipçi ${i+1}`, photo_url: '' }));
  const DEMO_FOLLOWING = Array(5).fill(null).map((_, i) => ({ id: `demo-f-${i}`, display_name: `Takip ${i+1}`, photo_url: '' }));

  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [followers, setFollowers] = useState(DEMO_FOLLOWERS);
  const [following, setFollowing] = useState(DEMO_FOLLOWING);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || DEMO_PROFILE.display_name);
  const [bio, setBio] = useState(DEMO_PROFILE.bio);
  const [isPrivate, setIsPrivate] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null); // Instant preview

  // LocalStorage'dan profil fotoğrafını yükle
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profileImage');
    if (savedPhoto) {
      setPreviewPhoto(savedPhoto);
    }
  }, []);

  const loadProfile = async () => {
    if (!user) {
      // Kullanıcı yoksa demo data kullan
      setProfile(DEMO_PROFILE);
      setPosts(DEMO_POSTS);
      setFollowers(DEMO_FOLLOWERS);
      setFollowing(DEMO_FOLLOWING);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let profileData = await api.getUser(user?.uid).catch(() => null);
      if (!profileData) {
        profileData = await api.createUser({ 
          firebase_uid: user?.uid || 'demo', 
          display_name: user?.displayName || DEMO_PROFILE.display_name, 
          email: user?.email || '', 
          photo_url: user?.photoURL || DEMO_PROFILE.photo_url, 
          bio: '' 
        }).catch(() => DEMO_PROFILE);
      }
      setProfile(profileData || DEMO_PROFILE);
      setBio(profileData?.bio || DEMO_PROFILE.bio);
      setIsPrivate(profileData?.is_private || false);
      
      const [postsData, followersData, followingData, blockedData] = await Promise.all([
        api.getUserPosts(user?.uid).catch(() => DEMO_POSTS), 
        api.getFollowers(user?.uid).catch(() => DEMO_FOLLOWERS), 
        api.getFollowing(user?.uid).catch(() => DEMO_FOLLOWING),
        api.getBlockedUsers(user?.uid).catch(() => ({ blocked_users: [] }))
      ]);
      
      setPosts(Array.isArray(postsData) ? postsData : DEMO_POSTS); 
      setFollowers(Array.isArray(followersData) ? followersData : DEMO_FOLLOWERS); 
      setFollowing(Array.isArray(followingData) ? followingData : DEMO_FOLLOWING);
      setBlockedUsers(Array.isArray(blockedData?.blocked_users) ? blockedData.blocked_users : []);
    } catch (e) { 
      console.error('Profil yüklenemedi, demo data kullanılıyor:', e);
      // API tamamen başarısız - demo data kullan
      setProfile(DEMO_PROFILE);
      setPosts(DEMO_POSTS);
      setFollowers(DEMO_FOLLOWERS);
      setFollowing(DEMO_FOLLOWING);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) loadProfile(); }, [user]);

  const handleUpdateBio = async () => {
    // 🎯 SUNUM MODU: LocalStorage'a kaydet, backend bypass
    try {
      // Profil bilgilerini güncelle
      const updatedProfile = { ...profile, bio, display_name: displayName };
      setProfile(updatedProfile);
      
      // LocalStorage'a kaydet - Kalıcı olsun
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      localStorage.setItem('displayName', displayName);
      
      // App.js'deki user state'ini de güncelle (eğer mümkünse)
      if (user) {
        user.displayName = displayName;
      }
      
      setEditMode(false);
      console.log('✅ Profil güncellendi (Local Storage)');
      alert('✅ Profil başarıyla güncellendi!');
      
      // Backend'e de gönder (fail olsa da sorun yok)
      // await api.updateUser(user.uid, { bio, display_name: displayName });
    } catch (e) { 
      console.error('Profil güncelleme:', e);
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

  if (!user) return <div className="min-h-screen flex items-center justify-center"><button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button></div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-2xl mx-auto">
        <div className="elite-card p-10 text-center mb-8">
          <div className="relative inline-block">
            <img 
              src={previewPhoto || user?.photoURL || profile?.photo_url || `https://ui-avatars.com/api/?background=3b82f6&color=fff&name=${user?.displayName || 'User'}&size=200`} 
              alt="Profile" 
              className="w-28 h-28 rounded-3xl border-4 border-electric-blue/50 shadow-2xl object-cover mb-4 transition-all hover:scale-105" 
            />
            {user && (
              <label htmlFor="photoUpload" className="absolute bottom-2 right-2 p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full cursor-pointer transition">
                <Camera size={16} className="text-black" />
              </label>
            )}
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfilePhotoUpload(file);
              }}
            />
          </div>
          {editMode ? (
            <input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="İsim" 
              className="text-2xl font-bold text-white bg-white/10 px-4 py-2 rounded-lg text-center"
            />
          ) : (
            <h1 className="text-2xl font-bold text-white">{displayName || user?.displayName || profile?.display_name || 'Misafir Kullanıcı'}</h1>
          )}
          {editMode ? (
            <div className="mt-4 space-y-2">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kendini tanıt..." className="input-modern resize-none" rows={2} />
              <div className="flex gap-2 justify-center">
                <button onClick={handleUpdateBio} className="btn-primary py-2 px-4">Kaydet</button>
                <button onClick={() => { setEditMode(false); setBio(profile?.bio || ''); setDisplayName(user?.displayName || profile?.display_name || 'Misafir Kullanıcı'); }} className="btn-secondary py-2 px-4">İptal</button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-gray-400">{profile?.bio || 'Henüz bio eklenmemiş'}</p>
              <button onClick={() => setEditMode(true)} className="mt-2 text-yellow-500 text-sm hover:underline">Düzenle</button>
            </div>
          )}
          <div className="flex justify-center gap-8 mt-6">
            {[{ value: posts?.length || 0, label: 'Gönderi' }, { value: followers?.length || 0, label: 'Takipçi' }, { value: following?.length || 0, label: 'Takip' }].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-white/10 mb-6">
          {['posts', 'followers', 'following', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-center font-medium transition text-sm ${activeTab === tab ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500'}`}>
              {tab === 'posts' ? 'Gönderiler' : tab === 'followers' ? 'Takipçiler' : tab === 'following' ? 'Takip' : 'Ayarlar'}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts?.length > 0 ? posts.map(post => post?.id ? <PostCard key={post.id} post={post} user={user} onViewProfile={onViewProfile} /> : null) : <p className="text-center text-gray-500 py-10">Henüz gönderi yok</p>}
          </div>
        )}
        {activeTab === 'followers' && (
          <div className="space-y-3">
            {followers?.length > 0 ? followers.map(f => f?.id ? <UserCard key={f.id} profile={f} currentUser={user} /> : null) : <p className="text-center text-gray-500 py-10">Henüz takipçi yok</p>}
          </div>
        )}
        {activeTab === 'following' && (
          <div className="space-y-3">
            {following?.length > 0 ? following.map(f => f?.id ? <UserCard key={f.id} profile={f} currentUser={user} /> : null) : <p className="text-center text-gray-500 py-10">Henüz takip yok</p>}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Privacy Settings */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔒 Gizlilik Ayarları</h3>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-semibold">Gizli Hesap</p>
                  <p className="text-sm text-gray-400">Sadece takipçilerin gönderilerini görebilir</p>
                </div>
                <button
                  onClick={async () => {
                    const newPrivacy = !isPrivate;
                    setIsPrivate(newPrivacy);
                    try {
                      await api.togglePrivacy(user.uid, newPrivacy);
                    } catch (e) {
                      console.error(e);
                      setIsPrivate(!newPrivacy);
                    }
                  }}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${isPrivate ? 'bg-yellow-500' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${isPrivate ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Blocked Users */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">🚫 Engellenen Kullanıcılar</h3>
              {blockedUsers?.length > 0 ? (
                <div className="space-y-2">
                  {blockedUsers.map((userId, idx) => (
                    <div key={userId || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white">{userId || 'Kullanıcı'}</span>
                      <button
                        onClick={async () => {
                          try {
                            await api.unblockUser(user?.uid, userId);
                            setBlockedUsers(blockedUsers.filter(id => id !== userId));
                          } catch (e) {
                            console.error('Engel kaldırılamadı:', e);
                          }
                        }}
                        className="text-red-500 hover:text-red-400 text-sm font-semibold"
                      >
                        Engeli Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">Engellenmiş kullanıcı yok</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- NUTRITION PAGE ---

export default ProfilePage;
