import { useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { useAdaptiveUI } from './useAdaptiveUI';

// ─── TEXT-TO-SPEECH HOOK ───
// Provides speak() and stop() functions.
// Only speaks when the "Read Aloud" toggle is ON.
// Automatically stops when the component unmounts.
export const useSpeech = () => {
  const { voiceAssist } = useAdaptiveUI();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      Speech.stop();
    };
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!voiceAssist || !text || !isMounted.current) return;
    // Stop any current speech first
    Speech.stop();
    Speech.speak(text, {
      language: options.language || 'en',
      pitch: options.pitch || 1.0,
      rate: options.rate || 0.85, // Slightly slower for elderly users
      ...options,
    });
  }, [voiceAssist]);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  // Speak only when voice assist is enabled
  const speakIfEnabled = useCallback((text, options = {}) => {
    if (voiceAssist) {
      speak(text, options);
    }
  }, [voiceAssist, speak]);

  return {
    speak,        // Always speaks the text (if voiceAssist is ON)
    stop,         // Stops current speech
    speakIfEnabled, // Same as speak but more semantic
    isEnabled: voiceAssist,
  };
};
