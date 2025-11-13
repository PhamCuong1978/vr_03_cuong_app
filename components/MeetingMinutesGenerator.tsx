
import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import type { MeetingDetails } from '../types';

// Types for the Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface MeetingMinutesGeneratorProps {
    onSubmit: (details: MeetingDetails) => void;
    disabled: boolean;
}

const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled: boolean;
    onMicClick: () => void;
    isListening: boolean;
    micSupported: boolean;
    showError: boolean;
}> = ({ label, value, onChange, placeholder, disabled, onMicClick, isListening, micSupported, showError }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={isListening ? 'Đang nghe...' : (showError ? 'Không nghe rõ. Vui lòng thử lại...' : placeholder)}
                disabled={disabled}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                aria-label={label}
            />
            {micSupported && (
                 <button
                    type="button"
                    onClick={onMicClick}
                    disabled={disabled}
                    className={`absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    title={`Dictate for ${label}`}
                >
                    <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                </button>
            )}
        </div>
    </div>
);


const MeetingMinutesGenerator: React.FC<MeetingMinutesGeneratorProps> = ({ onSubmit, disabled }) => {
    const [details, setDetails] = useState<MeetingDetails>({
        timeAndPlace: '',
        attendees: '',
        chair: '',
        topic: '',
    });

    const [listeningField, setListeningField] = useState<keyof MeetingDetails | null>(null);
    const [errorField, setErrorField] = useState<keyof MeetingDetails | null>(null);
    const [micSupported, setMicSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const activeFieldRef = useRef<keyof MeetingDetails | null>(null);


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMicSupported(false);
            console.warn('Speech Recognition not supported by this browser.');
            return;
        }

        setMicSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'vi-VN';

        recognition.onstart = () => {
             // This is handled by the handleMicClick function to set the specific field.
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            const fieldToUpdate = activeFieldRef.current;
            if (fieldToUpdate) {
                setDetails(prevDetails => {
                    const existingText = prevDetails[fieldToUpdate];
                    return {
                        ...prevDetails,
                        [fieldToUpdate]: (existingText ? existingText + ' ' : '') + transcript,
                    };
                });
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                if (activeFieldRef.current) {
                    setErrorField(activeFieldRef.current);
                    setTimeout(() => setErrorField(null), 3000);
                }
            } else if (event.error === 'not-allowed') {
                alert('Bạn đã từ chối quyền truy cập micro. Vui lòng cho phép truy cập micro trong cài đặt trình duyệt để sử dụng tính năng này.');
            } else {
                alert(`Đã xảy ra lỗi khi nhận dạng giọng nói: ${event.error}. Vui lòng thử lại.`);
            }

            if (activeFieldRef.current) {
                setListeningField(null);
                activeFieldRef.current = null;
            }
        };

        recognition.onend = () => {
             if (activeFieldRef.current) {
                setListeningField(null);
                activeFieldRef.current = null;
            }
        };
        
        recognitionRef.current = recognition;
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const handleMicClick = (field: keyof MeetingDetails) => {
        if (!micSupported || !recognitionRef.current) return;

        const isCurrentlyListening = listeningField !== null;
        const isThisFieldListening = listeningField === field;

        if (isThisFieldListening) {
             recognitionRef.current.stop();
        } else if (isCurrentlyListening) {
            // Stop the current one, then start the new one.
            // For simplicity, we'll just require the user to stop the active one first.
            // The UI already disables other buttons.
        }
        else {
            activeFieldRef.current = field;
            setListeningField(field);
            setErrorField(null); // Clear previous errors
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
                setListeningField(null); 
                activeFieldRef.current = null;
            }
        }
    };

    const handleChange = (field: keyof MeetingDetails, value: string) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(details);
    };

    const renderInputField = (fieldKey: keyof MeetingDetails, label: string, placeholder: string) => {
         const isAnyFieldListening = listeningField !== null;
         const isThisFieldListening = listeningField === fieldKey;

        return (
            <InputField
                label={label}
                value={details[fieldKey]}
                onChange={v => handleChange(fieldKey, v)}
                placeholder={placeholder}
                disabled={disabled || (isAnyFieldListening && !isThisFieldListening)}
                onMicClick={() => handleMicClick(fieldKey)}
                isListening={isThisFieldListening}
                micSupported={micSupported}
                showError={errorField === fieldKey}
            />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Cung cấp các chi tiết (không bắt buộc) để đưa vào biên bản. AI sẽ cố gắng điền thông tin còn thiếu từ văn bản. Bấm vào micro để đọc.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderInputField('timeAndPlace', 'Thời gian & Địa điểm', "VD: 2 PM, 26/10, 2023, Phòng 4")}
                {renderInputField('attendees', 'Người tham dự', "VD: John D, Jane S, Đội Marketing")}
                {renderInputField('chair', 'Chủ tọa', "VD: John Doe")}
                {renderInputField('topic', 'Chủ đề / Mục đích', "VD: Chiến lược Marketing Quý 4")}
            </div>
            <div className="text-center pt-2">
                <button
                    type="submit"
                    disabled={disabled || listeningField !== null}
                    className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white font-bold rounded-lg shadow-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                    {disabled ? 'Đang tạo...' : '📝 Tạo biên bản họp'}
                </button>
            </div>
        </form>
    );
};

export default MeetingMinutesGenerator;
