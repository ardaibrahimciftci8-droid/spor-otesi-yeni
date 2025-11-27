// Vision API utilities for image analysis
const GOOGLE_VISION_API_KEY = process.env.REACT_APP_GOOGLE_VISION_API_KEY;

// Analyze food image
export const analyzeFoodImage = async (imageFile) => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 5 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (data.responses && data.responses[0]) {
      const result = data.responses[0];
      
      // Extract food-related labels
      const foodLabels = result.labelAnnotations?.filter(label => 
        isFoodRelated(label.description)
      ) || [];
      
      // Extract text (for nutrition labels)
      const texts = result.textAnnotations?.map(t => t.description) || [];
      
      // Extract objects
      const objects = result.localizedObjectAnnotations?.map(obj => ({
        name: obj.name,
        confidence: obj.score
      })) || [];
      
      return {
        foodItems: foodLabels.map(l => l.description),
        confidence: foodLabels[0]?.score || 0,
        nutritionText: texts,
        objects,
        rawData: result
      };
    }
    
    throw new Error('No analysis results');
  } catch (error) {
    console.error('Vision API error:', error);
    throw error;
  }
};

// Analyze exercise form
export const analyzeExerciseForm = async (imageFile) => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image.split(',')[1]
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              { type: 'IMAGE_PROPERTIES' }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (data.responses && data.responses[0]) {
      const result = data.responses[0];
      
      // Extract exercise-related labels
      const exerciseLabels = result.labelAnnotations?.filter(label =>
        isExerciseRelated(label.description)
      ) || [];
      
      const objects = result.localizedObjectAnnotations || [];
      
      return {
        exerciseType: exerciseLabels.map(l => l.description),
        objects: objects.map(obj => obj.name),
        confidence: exerciseLabels[0]?.score || 0,
        rawData: result
      };
    }
    
    throw new Error('No analysis results');
  } catch (error) {
    console.error('Exercise analysis error:', error);
    throw error;
  }
};

// General image analysis
export const analyzeImage = async (imageFile) => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image.split(',')[1]
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION' },
              { type: 'FACE_DETECTION' },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    return data.responses[0];
  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
};

// Helper: Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Check if label is food-related
const isFoodRelated = (label) => {
  const foodKeywords = [
    'food', 'yemek', 'meal', 'dish', 'cuisine', 'breakfast', 'lunch', 'dinner',
    'fruit', 'meyve', 'vegetable', 'sebze', 'meat', 'et', 'fish', 'balık',
    'bread', 'ekmek', 'rice', 'pirinç', 'pasta', 'salad', 'salata',
    'drink', 'içecek', 'beverage', 'snack', 'atıştırmalık', 'dessert', 'tatlı'
  ];
  
  return foodKeywords.some(keyword => 
    label.toLowerCase().includes(keyword)
  );
};

// Helper: Check if label is exercise-related
const isExerciseRelated = (label) => {
  const exerciseKeywords = [
    'exercise', 'egzersiz', 'fitness', 'workout', 'training', 'antrenman',
    'gym', 'spor', 'sport', 'running', 'koşu', 'cycling', 'bisiklet',
    'yoga', 'pilates', 'swimming', 'yüzme', 'weights', 'ağırlık',
    'cardio', 'strength', 'muscle', 'kas', 'athletic', 'atletik'
  ];
  
  return exerciseKeywords.some(keyword =>
    label.toLowerCase().includes(keyword)
  );
};

// Get AI-powered nutrition estimation
export const estimateNutrition = async (foodItems) => {
  // This would typically call an AI service
  // For now, return a placeholder
  return {
    estimatedCalories: Math.floor(Math.random() * 500) + 200,
    estimatedProtein: Math.floor(Math.random() * 30) + 10,
    estimatedCarbs: Math.floor(Math.random() * 50) + 20,
    estimatedFat: Math.floor(Math.random() * 20) + 5,
    confidence: 0.7
  };
};
