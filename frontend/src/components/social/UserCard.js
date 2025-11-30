import React, { useState, useEffect } from 'react';
import api from '../../api';

const UserCard = ({ profile, currentUser, onViewProfile }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && profile.firebase_uid !== currentUser.uid) {
      api.checkFollowing(profile.firebase_uid, currentUser.uid).then(res => setIsFollowing(res.is_following)).catch(() => {});
    }
  }, [profile.firebase_uid, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (isFollowing) await api.unfollowUser(profile.firebase_uid, currentUser.uid);
      else await api.followUser(profile.firebase_uid, currentUser.uid);
      setIsFollowing(!isFollowing);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onViewProfile}>
        <img src={profile.photo_url || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl border-2 border-white/10" />
        <div>
          <h4 className="font-bold text-white">{profile.display_name}</h4>
          <p className="text-sm text-gray-400">{profile.followers_count || 0} takipçi</p>
        </div>
      </div>
      {currentUser && profile.firebase_uid !== currentUser.uid && (
        <button onClick={handleFollow} disabled={loading} className={`px-4 py-2 rounded-xl font-medium transition ${isFollowing ? 'bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-500 border border-white/10' : 'btn-primary'}`}>
          {loading ? '...' : (isFollowing ? 'Takipten Çık' : 'Takip Et')}
        </button>
      )}
    </div>
  );
};

export default UserCard;