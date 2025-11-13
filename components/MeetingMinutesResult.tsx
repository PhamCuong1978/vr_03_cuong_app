import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import type { MeetingDetails } from '../types';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { StopIcon } from './icons/StopIcon';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';


interface MeetingMinutesResultProps {
    htmlContent: string;
    meetingDetails: MeetingDetails | null;
}

const MeetingMinutesResult: React.FC<MeetingMinutesResultProps> = ({ htmlContent, meetingDetails }) => {
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState('');

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    // Cleanup effect for when the component unmounts or the content changes
    useEffect(() => {
        return () => {
            if (sourceNodeRef.current) {
                try {
                    sourceNodeRef.current.stop();
                } catch (e) {
                    // Ignore error if already stopped
                }
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [htmlContent]);

    const getHtmlBlob = () => new Blob([htmlContent], { type: 'text/html' });

    const handleDownload = () => {
        const blob = getHtmlBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let location = 'chua_ro_dia_diem';
        if (meetingDetails?.timeAndPlace) {
            const parts = meetingDetails.timeAndPlace.split(',');
            const potentialLocation = parts[parts.length - 1].trim();
            if (potentialLocation) {
                location = potentialLocation
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d").replace(/Đ/g, "D")
                    .replace(/[^a-zA-Z0-9-]/g, '_')
                    .replace(/_+/g, '_');
            }
        }
        
        a.download = `Biên bản cuộc họp ngày ${day} tháng ${month} năm ${year} tại ${location}.html`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePreview = () => {
        const blob = getHtmlBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };
    
    const handlePlayback = async () => {
        if (isPlaying && sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            return;
        }
        if (isGeneratingAudio) return;

        setIsGeneratingAudio(true);
        setAudioError('');

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            tempDiv.querySelectorAll('p, li, h1, h2, h3, h4').forEach(el => {
                el.insertAdjacentText('beforeend', '. ');
            });
            const textToSpeak = tempDiv.innerText;

            if (!textToSpeak.trim()) throw new Error("Không có nội dung để đọc.");

            const base64Audio = await generateSpeech(textToSpeak);
            
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1
            );
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
                setIsPlaying(false);
                sourceNodeRef.current = null;
            };
            
            source.start();
            sourceNodeRef.current = source;
            setIsPlaying(true);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi tạo âm thanh.";
            console.error(err);
            setAudioError(errorMessage);
        } finally {
            setIsGeneratingAudio(false);
        }
    };


    return (
        <div className="relative bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
                 <button
                    onClick={handlePlayback}
                    className="p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition disabled:opacity-50 disabled:cursor-wait"
                    title={isPlaying ? "Dừng đọc" : "Đọc to"}
                    aria-label={isPlaying ? "Dừng đọc" : "Đọc to"}
                    disabled={isGeneratingAudio}
                >
                    {isGeneratingAudio ? (
                        <SpeakerWaveIcon className="w-5 h-5 animate-pulse" />
                    ) : isPlaying ? (
                        <StopIcon className="w-5 h-5 text-red-500" />
                    ) : (
                        <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                </button>
                <button
                    onClick={handlePreview}
                    className="p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition"
                    title="Preview in new tab"
                    aria-label="Preview in new tab"
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleDownload}
                    className="p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition"
                    title="Download as .html"
                    aria-label="Download as .html"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="w-full h-72 sm:h-80 bg-white rounded-md overflow-hidden border border-gray-200">
                 <iframe
                    srcDoc={htmlContent}
                    title="Meeting Minutes Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                />
            </div>
             {audioError && <p className="text-center text-xs text-red-500 font-medium">{audioError}</p>}
        </div>
    );
};

export default MeetingMinutesResult;
