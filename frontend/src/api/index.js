import axios from 'axios';
import { API } from '../utils/constants';

const api = {
  // User APIs
  createUser: async (userData) => {
    const res = await axios.post(`${API}/users`, userData);
    return res.data;
  },
  getUser: async (firebaseUid) => {
    try {
      const res = await axios.get(`${API}/users/${firebaseUid}`);
      return res.data;
    } catch (e) {
      return null;
    }
  },
  updateUser: async (firebaseUid, data) => {
    const res = await axios.put(`${API}/users/${firebaseUid}`, data);
    return res.data;
  },
  searchUsers: async (query) => {
    const res = await axios.get(`${API}/users/search/query?q=${query}`);
    return res.data;
  },

  // Follow APIs
  followUser: async (followingId, followerId) => {
    const res = await axios.post(`${API}/follow/${followingId}?follower_id=${followerId}`);
    return res.data;
  },
  unfollowUser: async (followingId, followerId) => {
    const res = await axios.delete(`${API}/follow/${followingId}?follower_id=${followerId}`);
    return res.data;
  },
  checkFollowing: async (followingId, followerId) => {
    const res = await axios.get(`${API}/follow/check/${followingId}?follower_id=${followerId}`);
    return res.data;
  },
  getFollowers: async (userId) => {
    const res = await axios.get(`${API}/followers/${userId}`);
    return res.data;
  },
  getFollowing: async (userId) => {
    const res = await axios.get(`${API}/following/${userId}`);
    return res.data;
  },

  // Post APIs
  createPost: async (postData) => {
    const res = await axios.post(`${API}/posts`, postData);
    return res.data;
  },
  getFeed: async (userId, skip = 0) => {
    const url = userId ? `${API}/posts/feed?user_id=${userId}&skip=${skip}` : `${API}/posts/feed?skip=${skip}`;
    const res = await axios.get(url);
    return res.data;
  },
  getUserPosts: async (userId) => {
    const res = await axios.get(`${API}/posts/user/${userId}`);
    return res.data;
  },
  deletePost: async (postId, userId) => {
    const res = await axios.delete(`${API}/posts/${postId}?user_id=${userId}`);
    return res.data;
  },
  likePost: async (postId, userId) => {
    const res = await axios.post(`${API}/posts/${postId}/like?user_id=${userId}`);
    return res.data;
  },
  unlikePost: async (postId, userId) => {
    const res = await axios.delete(`${API}/posts/${postId}/like?user_id=${userId}`);
    return res.data;
  },
  checkLiked: async (postId, userId) => {
    const res = await axios.get(`${API}/posts/${postId}/liked?user_id=${userId}`);
    return res.data;
  },

  // Comment APIs
  createComment: async (commentData) => {
    const res = await axios.post(`${API}/comments`, commentData);
    return res.data;
  },
  getComments: async (postId) => {
    const res = await axios.get(`${API}/comments/${postId}`);
    return res.data;
  },

  // Messaging APIs
  getOrCreateConversation: async (p1Id, p1Name, p1Photo, p2Id, p2Name, p2Photo) => {
    const res = await axios.post(
      `${API}/conversations?participant2_id=${p2Id}&participant2_name=${encodeURIComponent(p2Name)}&participant2_photo=${encodeURIComponent(p2Photo || '')}`,
      null,
      { params: { participant1_id: p1Id, participant1_name: p1Name, participant1_photo: p1Photo || '' }}
    );
    return res.data;
  },
  getConversations: async (userId) => {
    const res = await axios.get(`${API}/conversations?user_id=${userId}`);
    return res.data;
  },
  sendMessage: async (messageData) => {
    const res = await axios.post(`${API}/messages`, messageData);
    return res.data;
  },
  getMessages: async (conversationId) => {
    const res = await axios.get(`${API}/messages/${conversationId}`);
    return res.data;
  },

  // Activity APIs
  createActivity: async (activityData) => {
    const res = await axios.post(`${API}/activities`, activityData);
    return res.data;
  },
  getActivities: async (userId) => {
    const res = await axios.get(`${API}/activities/${userId}`);
    return res.data;
  },
  getActivityStats: async (userId, days = 7) => {
    const res = await axios.get(`${API}/activities/${userId}/stats?days=${days}`);
    return res.data;
  },
  deleteActivity: async (activityId, userId) => {
    const res = await axios.delete(`${API}/activities/${activityId}?user_id=${userId}`);
    return res.data;
  },

  // Sleep APIs
  createSleepRecord: async (sleepData) => {
    const res = await axios.post(`${API}/sleep`, sleepData);
    return res.data;
  },
  getSleepRecords: async (userId) => {
    const res = await axios.get(`${API}/sleep/${userId}`);
    return res.data;
  },
  getSleepStats: async (userId, days = 7) => {
    const res = await axios.get(`${API}/sleep/${userId}/stats?days=${days}`);
    return res.data;
  },

  // AI APIs
  analyzeActivity: async (userId) => {
    const res = await axios.post(`${API}/ai/analyze-activity?user_id=${userId}`);
    return res.data;
  },

  // Upload APIs
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API}/upload/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API}/upload/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // AI Coach APIs
  coachChat: async (userId, coachType, userMessage) => {
    const res = await axios.post(`${API}/coach/chat`, {
      user_id: userId,
      coach_type: coachType,
      user_message: userMessage
    });
    return res.data;
  },
  getCoachHistory: async (userId, coachType = null) => {
    const url = coachType 
      ? `${API}/coach/history/${userId}?coach_type=${coachType}`
      : `${API}/coach/history/${userId}`;
    const res = await axios.get(url);
    return res.data;
  },

  // Yoga Program APIs
  generateYogaProgram: async (userId, programName, duration, difficulty, preferences = '') => {
    const res = await axios.post(`${API}/yoga/generate-program`, {
      user_id: userId,
      program_name: programName,
      duration_minutes: duration,
      difficulty: difficulty,
      user_preferences: preferences
    });
    return res.data;
  },
  getUserYogaPrograms: async (userId) => {
    const res = await axios.get(`${API}/yoga/programs/${userId}`);
    return res.data;
  },

  // Notification APIs
  saveFCMToken: async (userId, fcmToken) => {
    const res = await axios.post(`${API}/notifications/token?user_id=${userId}&fcm_token=${fcmToken}`);
    return res.data;
  },
  getNotifications: async (userId, limit = 20) => {
    const res = await axios.get(`${API}/notifications/${userId}?limit=${limit}`);
    return res.data;
  },
  markNotificationRead: async (notificationId) => {
    const res = await axios.post(`${API}/notifications/${notificationId}/read`);
    return res.data;
  },
  updateNotificationPreferences: async (userId, preferences) => {
    const res = await axios.put(`${API}/notifications/preferences/${userId}`, preferences);
    return res.data;
  },
  getNotificationPreferences: async (userId) => {
    const res = await axios.get(`${API}/notifications/preferences/${userId}`);
    return res.data;
  },
  logNotification: async (notification) => {
    const res = await axios.post(`${API}/notifications/log`, notification);
    return res.data;
  },

  // Analytics APIs
  trackEvent: async (eventType, userId = null, eventData = null) => {
    const res = await axios.post(`${API}/analytics/event`, {
      event_type: eventType,
      user_id: userId,
      event_data: eventData
    });
    return res.data;
  },
  getAnalyticsStats: async () => {
    const res = await axios.get(`${API}/analytics/stats`);
    return res.data;
  },
  getUserAnalytics: async (userId) => {
    const res = await axios.get(`${API}/analytics/user/${userId}`);
    return res.data;
  },

  // Goals APIs
  createGoal: async (userId, goalType, title, description, targetValue = null, unit = null, deadline = null) => {
    const res = await axios.post(`${API}/goals`, {
      user_id: userId,
      goal_type: goalType,
      title,
      description,
      target_value: targetValue,
      unit,
      deadline
    });
    return res.data;
  },
  getUserGoals: async (userId, status = null) => {
    const url = status ? `${API}/goals/${userId}?status=${status}` : `${API}/goals/${userId}`;
    const res = await axios.get(url);
    return res.data;
  },
  updateGoal: async (goalId, currentValue) => {
    const res = await axios.put(`${API}/goals/${goalId}?current_value=${currentValue}`);
    return res.data;
  },
  deleteGoal: async (goalId) => {
    const res = await axios.delete(`${API}/goals/${goalId}`);
    return res.data;
  },

  // Achievements APIs
  getUserAchievements: async (userId) => {
    const res = await axios.get(`${API}/achievements/${userId}`);
    return res.data;
  },
  checkAchievements: async (userId) => {
    const res = await axios.post(`${API}/achievements/check/${userId}`);
    return res.data;
  },

  // Progress Reports APIs
  generateProgressReport: async (userId, reportType = 'weekly') => {
    const res = await axios.post(`${API}/reports/generate/${userId}?report_type=${reportType}`);
    return res.data;
  },
  getUserReports: async (userId, limit = 10) => {
    const res = await axios.get(`${API}/reports/${userId}?limit=${limit}`);
    return res.data;
  },

  // Google Fit APIs
  syncGoogleFitData: async (userId, activities) => {
    const res = await axios.post(`${API}/googlefit/sync`, {
      user_id: userId,
      activities
    });
    return res.data;
  },

  // Vision Analysis APIs
  analyzeFoodImage: async (userId, imageData, foodItems) => {
    const res = await axios.post(`${API}/vision/analyze-food`, {
      user_id: userId,
      image_data: imageData,
      food_items: foodItems
    });
    return res.data;
  },
  analyzeExerciseImage: async (userId, imageData, exerciseType) => {
    const res = await axios.post(`${API}/vision/analyze-exercise`, {
      user_id: userId,
      image_data: imageData,
      exercise_type: exerciseType
    });
    return res.data;
  },

  // Reels APIs
  getReelsFeed: async (limit = 20) => {
    const res = await axios.get(`${API}/reels/feed?limit=${limit}`);
    return res.data;
  },
  createReel: async (reelData) => {
    const res = await axios.post(`${API}/reels`, reelData);
    return res.data;
  },
  likeReel: async (reelId, userId) => {
    const res = await axios.post(`${API}/reels/${reelId}/like?user_id=${userId}`);
    return res.data;
  },
  commentOnReel: async (reelId, commentData) => {
    const res = await axios.post(`${API}/reels/${reelId}/comment`, commentData);
    return res.data;
  },
  getReelComments: async (reelId) => {
    const res = await axios.get(`${API}/reels/${reelId}/comments`);
    return res.data;
  },
  incrementReelViews: async (reelId) => {
    const res = await axios.post(`${API}/reels/${reelId}/view`);
    return res.data;
  },

  // Block & Privacy APIs
  blockUser: async (userId, targetUserId) => {
    const res = await axios.post(`${API}/users/${userId}/block?target_user_id=${targetUserId}`);
    return res.data;
  },
  unblockUser: async (userId, targetUserId) => {
    const res = await axios.post(`${API}/users/${userId}/unblock?target_user_id=${targetUserId}`);
    return res.data;
  },
  getBlockedUsers: async (userId) => {
    const res = await axios.get(`${API}/users/${userId}/blocked`);
    return res.data;
  },
  togglePrivacy: async (userId, isPrivate) => {
    const res = await axios.post(`${API}/users/${userId}/privacy?is_private=${isPrivate}`);
    return res.data;
  },
};

export default api;
