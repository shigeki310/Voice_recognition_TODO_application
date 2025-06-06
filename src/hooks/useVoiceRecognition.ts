import { useState, useEffect, useCallback } from 'react';
import { VoiceRecognitionState } from '../types/todo';

export function useVoiceRecognition() {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null,
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ja-JP';

      recognitionInstance.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setState(prev => ({ ...prev, transcript }));
      };

      recognitionInstance.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          error: event.error,
          isListening: false 
        }));
      };

      recognitionInstance.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      setRecognition(recognitionInstance);
      setState(prev => ({ ...prev, isSupported: true }));
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !state.isListening) {
      setState(prev => ({ ...prev, transcript: '', error: null }));
      recognition.start();
    }
  }, [recognition, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognition && state.isListening) {
      recognition.stop();
    }
  }, [recognition, state.isListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}