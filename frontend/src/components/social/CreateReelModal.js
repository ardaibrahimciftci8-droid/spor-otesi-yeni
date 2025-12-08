import React, { useState, useRef } from 'react';
import { X, Video, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';

const CreateReelModal = ({ user, onClose, onReelCreated }) => {
  const [content, setContent] = useState('');
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('❌ Lütfen sadece video dosyası seçin!');
      return;
    }
    
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) {
      alert('❌ Lütfen bir video seçin!');
      return;
    }
    
    setLoading(true);
    try {
      // Upload video
      const uploadRes = await api.uploadVideo(video);
      
      // Create post as Reel
      const post = await api.createPost({
        user_id: user.uid,
        user_name: user.displayName,
        user_photo: user.photoURL,
        content: content || 'Yeni Reel 🎬',
        media_url: uploadRes.url,
        media_type: 'video'
      });
      
      onReelCreated(post);
      onClose();
      alert('✅ Reel başarıyla yüklendi!');
    } catch (e) {
      console.error('Reel yükleme hatası:', e);
      alert('❌ Reel yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9998 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="glass-card w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Video size={24} className="text-red-500" />
            Yeni Reel Yükle
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Video Upload Area */}
          {!videoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition"
            >
              <Upload size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-white font-semibold mb-2">Video Seç</p>
              <p className="text-gray-400 text-sm">MP4, MOV, AVI desteklenir</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleVideoSelect}
                accept="video/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video src={videoPreview} controls className="w-full max-h-96 object-contain" />
              <button
                type="button"
                onClick={() => {
                  setVideo(null);
                  setVideoPreview(null);
                }}
                className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-black transition"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Caption */}
          <div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Açıklama ekle... (opsiyonel)"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none focus:border-red-500/50 transition"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !video}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Yükleniyor...
              </>
            ) : (
              <>
                <Video size={20} />
                Reel Paylaş
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateReelModal;
