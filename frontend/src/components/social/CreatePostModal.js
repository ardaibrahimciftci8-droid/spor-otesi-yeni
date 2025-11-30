import React, { useState, useRef } from 'react';
import { X, Image, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';

const CreatePostModal = ({ user, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setMedia(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return;
    setLoading(true);
    try {
      let mediaUrl = null;
      if (media) {
        const res = mediaType === 'video' ? await api.uploadVideo(media) : await api.uploadImage(media);
        mediaUrl = res.url;
      }
      const post = await api.createPost({
        user_id: user.uid, user_name: user.displayName, user_photo: user.photoURL,
        content, media_url: mediaUrl, media_type: mediaType
      });
      onPostCreated(post);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Gönderi oluşturulurken hata oluştu');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-card w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Yeni Gönderi</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <img src={user?.photoURL || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=48'} alt="" className="w-12 h-12 rounded-xl" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Ne düşünüyorsun?" className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg" rows={4} />
          </div>
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden bg-white/5">
              {mediaType === 'video' ? <video src={mediaPreview} controls className="w-full max-h-64 object-cover" /> : <img src={mediaPreview} alt="" className="w-full max-h-64 object-cover" />}
              <button type="button" onClick={() => { setMedia(null); setMediaPreview(null); setMediaType(null); }} className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black"><X size={16} /></button>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition"><Image size={22} /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"><Video size={22} /></button>
            </div>
            <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary disabled:opacity-50">{loading ? 'Paylaşılıyor...' : 'Paylaş'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;