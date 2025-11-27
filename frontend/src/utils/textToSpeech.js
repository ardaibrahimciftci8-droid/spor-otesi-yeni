// Text-to-Speech utilities
const GOOGLE_TTS_API_KEY = 'AIzaSyCX9mTodIiwsWk0-_ux1AYgMbniUcqgAuo';

// Google Cloud Text-to-Speech
export const speakWithGoogleTTS = async (text, languageCode = 'tr-TR') => {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: 'tr-TR-Wavenet-E', // Female Turkish voice
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.audioContent) {
      // Play audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Google TTS error:', error);
    // Fallback to Web Speech API
    return speakWithWebSpeech(text, languageCode);
  }
};

// Web Speech API (Browser native - fallback)
export const speakWithWebSpeech = (text, lang = 'tr-TR') => {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find Turkish voice
      const voices = window.speechSynthesis.getVoices();
      const turkishVoice = voices.find(voice => voice.lang.startsWith('tr'));
      if (turkishVoice) {
        utterance.voice = turkishVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = (error) => {
        console.error('Web Speech error:', error);
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      reject(new Error('Speech synthesis not supported'));
    }
  });
};

// Smart speak - tries Google TTS first, falls back to Web Speech
export const speak = async (text, languageCode = 'tr-TR') => {
  try {
    // Try Google TTS first (better quality)
    await speakWithGoogleTTS(text, languageCode);
  } catch (error) {
    console.log('Falling back to Web Speech API');
    // Fallback to browser native
    await speakWithWebSpeech(text, languageCode);
  }
};

// Stop speaking
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Check if TTS is available
export const isTTSAvailable = () => {
  return 'speechSynthesis' in window || GOOGLE_TTS_API_KEY;
};

// Get available voices
export const getAvailableVoices = () => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};
