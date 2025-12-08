import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Users, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

const NotificationsPage = ({ user, setPage }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(user.uid);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-8 md:pt-24">
        <div className="text-center glass-card p-12">
          <MessageCircle size={64} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-6">Bildirimlerinizi görmek için giriş yapın</p>
          <button onClick={() => setPage('login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 px-4">
      <div className="animated-bg" />
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Bildirimler</h1>
          </div>
          <p className="text-gray-400">Tüm bildirimlerinizi burada görün</p>
        </motion.div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
                className={`glass-card p-4 cursor-pointer transition ${
                  notification.read ? 'opacity-60' : 'border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ${!notification.read && 'glow-blue'}`}>
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{notification.title}</h4>
                    <p className="text-sm text-gray-400">{notification.body}</p>
                    <span className="text-xs text-gray-600 mt-2 block">
                      {new Date(notification.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 glass-card">
              <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">Henüz bildirim yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- GOALS PAGE ---

export default NotificationsPage;
