// Google Fit Integration
const GOOGLE_FIT_CLIENT_ID = process.env.REACT_APP_GOOGLE_FIT_CLIENT_ID;
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
].join(' ');

let googleAuth = null;

// Initialize Google Fit
export const initGoogleFit = () => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_FIT_CLIENT_ID) {
      reject(new Error('Google Fit Client ID yapılandırılmamış'));
      return;
    }
    
    if (window.gapi) {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: GOOGLE_FIT_CLIENT_ID,
          scope: GOOGLE_FIT_SCOPES
        }).then((auth) => {
          googleAuth = auth;
          resolve(auth);
        }).catch((error) => {
          console.error('Google Fit initialization error:', error);
          reject(new Error('Google Fit yetkilendirme hatası. Lütfen domain ayarlarını kontrol edin.'));
        });
      });
    } else {
      reject(new Error('Google API yüklenmedi'));
    }
  });
};

// Sign in to Google Fit
export const signInGoogleFit = async () => {
  try {
    if (!googleAuth) {
      await initGoogleFit();
    }
    const user = await googleAuth.signIn();
    return user;
  } catch (error) {
    console.error('Google Fit sign in error:', error);
    throw error;
  }
};

// Get activities from Google Fit
export const getGoogleFitActivities = async (startDate, endDate) => {
  try {
    const accessToken = googleAuth.currentUser.get().getAuthResponse().access_token;
    
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
          }, {
            dataTypeName: 'com.google.distance.delta',
            dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'
          }, {
            dataTypeName: 'com.google.calories.expended',
            dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
          }, {
            dataTypeName: 'com.google.active_minutes',
            dataSourceId: 'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes'
          }],
          bucketByTime: { durationMillis: 86400000 }, // 1 day
          startTimeMillis: startDate.getTime(),
          endTimeMillis: endDate.getTime()
        })
      }
    );

    const data = await response.json();
    return parseGoogleFitData(data);
  } catch (error) {
    console.error('Error fetching Google Fit activities:', error);
    throw error;
  }
};

// Parse Google Fit data
const parseGoogleFitData = (data) => {
  const activities = [];
  
  if (data.bucket) {
    data.bucket.forEach(bucket => {
      const activity = {
        date: new Date(parseInt(bucket.startTimeMillis)),
        steps: 0,
        distance: 0,
        calories: 0,
        activeMinutes: 0
      };

      bucket.dataset.forEach(dataset => {
        dataset.point.forEach(point => {
          if (dataset.dataSourceId.includes('step_count')) {
            activity.steps = point.value[0].intVal;
          } else if (dataset.dataSourceId.includes('distance')) {
            activity.distance = (point.value[0].fpVal / 1000).toFixed(2); // meters to km
          } else if (dataset.dataSourceId.includes('calories')) {
            activity.calories = Math.round(point.value[0].fpVal);
          } else if (dataset.dataSourceId.includes('active_minutes')) {
            activity.activeMinutes = point.value[0].intVal;
          }
        });
      });

      if (activity.steps > 0 || activity.distance > 0) {
        activities.push(activity);
      }
    });
  }

  return activities;
};

// Get heart rate data
export const getHeartRateData = async (startDate, endDate) => {
  try {
    const accessToken = googleAuth.currentUser.get().getAuthResponse().access_token;
    
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.heart_rate.bpm'
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startDate.getTime(),
          endTimeMillis: endDate.getTime()
        })
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching heart rate:', error);
    throw error;
  }
};

// Get sleep data
export const getSleepData = async (startDate, endDate) => {
  try {
    const accessToken = googleAuth.currentUser.get().getAuthResponse().access_token;
    
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();
    
    // Filter sleep sessions
    const sleepSessions = data.session?.filter(s => s.activityType === 72) || [];
    
    return sleepSessions.map(session => ({
      startTime: new Date(session.startTimeMillis),
      endTime: new Date(session.endTimeMillis),
      duration: (session.endTimeMillis - session.startTimeMillis) / (1000 * 60), // minutes
    }));
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    throw error;
  }
};

// Check if user is connected
export const isGoogleFitConnected = () => {
  return googleAuth && googleAuth.isSignedIn.get();
};

// Sign out
export const signOutGoogleFit = async () => {
  if (googleAuth) {
    await googleAuth.signOut();
  }
};
