import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useEffect } from 'react';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            音声認識エラー
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* パルスエフェクト */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400 pulse-ring"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400 pulse-ring"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* アイコン */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isListening ? (
            <StopIcon className="w-6 h-6 text-white" />
          ) : (
            <MicrophoneIcon className="w-6 h-6 text-white" />
          )}
        </div>

        {/* 音声認識中の波形アニメーション */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-end gap-1"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-full wave-animation"
                  style={{
                    height: '12px',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 音声認識中のテキスト表示 */}
      <AnimatePresence>
        {transcript && isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-lg p-3 max-w-xs"
          >
            <p className="text-sm text-slate-700">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}