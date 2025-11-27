import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get FCM token
export const getFCMToken = async (app) => {
  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: 'BNxI3vPXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX' // Placeholder - will update
    });
    
    if (token) {
      console.log('✅ FCM Token:', token);
      return token;
    } else {
      console.log('❌ No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = (app) => {
  return new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
};

// Send browser notification
export const showBrowserNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };

    return notification;
  }
  return null;
};

// Notification types
export const NotificationTypes = {
  NEW_FOLLOWER: 'new_follower',
  NEW_MESSAGE: 'new_message',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
  YOGA_REMINDER: 'yoga_reminder',
  WORKOUT_REMINDER: 'workout_reminder',
  DAILY_GOAL: 'daily_goal'
};

// Create notification payload
export const createNotificationPayload = (type, data) => {
  const payloads = {
    [NotificationTypes.NEW_FOLLOWER]: {
      title: '🎉 Yeni Takipçi',
      body: `${data.followerName} sizi takip etmeye başladı!`,
      url: '/profile'
    },
    [NotificationTypes.NEW_MESSAGE]: {
      title: '💬 Yeni Mesaj',
      body: `${data.senderName}: ${data.messagePreview}`,
      url: '/social'
    },
    [NotificationTypes.POST_LIKED]: {
      title: '❤️ Beğeni',
      body: `${data.likerName} gönderinizi beğendi`,
      url: '/social'
    },
    [NotificationTypes.POST_COMMENTED]: {
      title: '💬 Yorum',
      body: `${data.commenterName} gönderinize yorum yaptı`,
      url: '/social'
    },
    [NotificationTypes.YOGA_REMINDER]: {
      title: '🧘 Yoga Vakti',
      body: 'Bugünkü yoga seansınızı yapmayı unutmayın!',
      url: '/yoga'
    },
    [NotificationTypes.WORKOUT_REMINDER]: {
      title: '💪 Antrenman Zamanı',
      body: 'Hareket etme zamanı! Hedefinize bir adım daha yaklaşın.',
      url: '/tracker'
    },
    [NotificationTypes.DAILY_GOAL]: {
      title: '🎯 Günlük Hedef',
      body: 'Bugünkü aktivite hedefinizi tamamlamaya az kaldı!',
      url: '/tracker'
    }
  };

  return payloads[type] || {
    title: 'Spor Ötesi',
    body: 'Yeni bildiriminiz var',
    url: '/'
  };
};
