
import React, { useState, useEffect } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript }) => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (SpeechRecognition) {
      const instance = new SpeechRecognition();
      instance.continuous = false;
      instance.lang = 'vi-VN';
      instance.interimResults = false;

      instance.onstart = () => {
        setIsError(false);
        setIsListening(true);
      };
      instance.onend = () => setIsListening(false);
      instance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };
      instance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            setIsError(true);
            setTimeout(() => setIsError(false), 2000);
        } else if (event.error === 'not-allowed') {
            alert('Bạn đã từ chối quyền truy cập micro. Vui lòng cho phép truy cập micro trong cài đặt trình duyệt để sử dụng tính năng này.');
        } else {
            alert(`Đã xảy ra lỗi khi nhận dạng giọng nói: ${event.error}. Vui lòng thử lại.`);
        }
        setIsListening(false);
      };
      setRecognition(instance);
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
    }
  }, [onTranscript]);

  const handleToggleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };
  
  if (!isAvailable) {
    return null;
  }

  const getButtonClass = () => {
    if (isError) return 'bg-yellow-400 text-white';
    if (isListening) return 'bg-red-500 text-white animate-pulse';
    return 'text-gray-400 hover:text-gray-600';
  };
  
  const getTitle = () => {
    if (isError) return 'Không nghe rõ. Vui lòng thử lại.';
    if (isListening) return 'Dừng ghi âm';
    return 'Nhập liệu bằng giọng nói';
  };

  return (
    <button
      type="button"
      onClick={handleToggleListen}
      className={`p-1 rounded-full transition-colors focus:outline-none ${getButtonClass()}`}
      aria-label={isListening ? 'Dừng ghi âm' : 'Nhập liệu bằng giọng nói'}
      title={getTitle()}
    >
      <MicrophoneIcon className="h-5 w-5" />
    </button>
  );
};
