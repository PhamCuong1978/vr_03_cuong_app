import React, { useState, useCallback, useRef } from 'react';
import { transcribeAudio, generateMeetingMinutes, regenerateMeetingMinutes } from '../services/geminiService';
import { processAudio, type AudioProcessingOptions } from '../utils/audioProcessor';
import FileUpload from '../components/FileUpload';
import Options from '../components/Options';
import TranscriptionResult from '../components/TranscriptionResult';
import ProgressBar from '../components/ProgressBar';
import { GithubIcon } from '../components/icons/GithubIcon';
import ModelSelector from '../components/ModelSelector';
import MeetingMinutesGenerator from '../components/MeetingMinutesGenerator';
import MeetingMinutesResult from '../components/MeetingMinutesResult';
import EditRequest from '../components/EditRequest';
import type { MeetingDetails } from '../types';
import SpeakerMapper from '../components/SpeakerMapper';

export const MeetingMinutesModule: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
    const [transcription, setTranscription] = useState<string>('');
    const [mappedTranscription, setMappedTranscription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [processingOptions, setProcessingOptions] = useState<AudioProcessingOptions>({
        convertToMono16k: true,
        noiseReduction: true,
        normalizeVolume: true,
        removeSilence: true,
    });

    const [meetingMinutesHtml, setMeetingMinutesHtml] = useState<string>('');
    const [isGeneratingMinutes, setIsGeneratingMinutes] = useState<boolean>(false);
    const [minutesError, setMinutesError] = useState<string | null>(null);
    const [lastMeetingDetails, setLastMeetingDetails] = useState<MeetingDetails | null>(null);
    const [minutesGenerationProgress, setMinutesGenerationProgress] = useState(0);
    const [minutesGenerationStatus, setMinutesGenerationStatus] = useState('');

    const [isEditingMinutes, setIsEditingMinutes] = useState<boolean>(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editProgress, setEditProgress] = useState<number>(0);
    const [editStatusMessage, setEditStatusMessage] = useState<string>('');


    const cancelRequestRef = useRef<boolean>(false);

    const handleFileSelect = (files: File[]) => {
        setSelectedFiles(files);
        setTranscription('');
        setMappedTranscription('');
        setError(null);
        setProgress(0);
        setStatusMessage('');
        setMeetingMinutesHtml('');
        setMinutesError(null);
        setEditError(null);
    };
    
    const handleOptionChange = (option: keyof AudioProcessingOptions, value: boolean) => {
        setProcessingOptions(prev => ({ ...prev, [option]: value }));
    };

    const handleCancel = () => {
        cancelRequestRef.current = true;
        if (isLoading) {
            setIsLoading(false);
            setProgress(0);
            setStatusMessage('Đã hủy bởi người dùng.');
        }
        if (isGeneratingMinutes) {
            setIsGeneratingMinutes(false);
            setMinutesError('Đã hủy tạo biên bản.');
        }
        if (isEditingMinutes) {
            setIsEditingMinutes(false);
            setEditError('Đã hủy yêu cầu chỉnh sửa.');
        }
    };

    const handleProcessFile = useCallback(async () => {
        if (selectedFiles.length === 0) {
            setError("Vui lòng chọn một hoặc nhiều tệp.");
            return;
        }

        setIsLoading(true);
        cancelRequestRef.current = false;
        setTranscription('');
        setMappedTranscription('');
        setError(null);
        setMeetingMinutesHtml('');
        setMinutesError(null);
        setEditError(null);

        const allContent: string[] = [];
        try {
             for (let i = 0; i < selectedFiles.length; i++) {
                let fileToProcess = selectedFiles[i];
                if (cancelRequestRef.current) return;

                const fileProgressStart = (i / selectedFiles.length) * 100;
                const fileProgressSpan = 100 / selectedFiles.length;
                
                setStatusMessage(`Đang xử lý tệp ${i + 1}/${selectedFiles.length}: ${fileToProcess.name}`);

                if (fileToProcess.type.startsWith('text/')) {
                    setProgress(fileProgressStart + fileProgressSpan * 0.5);
                    await new Promise(res => setTimeout(res, 200)); // UI delay
                    if (cancelRequestRef.current) return;

                    const textContent = await fileToProcess.text();
                    if (cancelRequestRef.current) return;

                    allContent.push(`--- Bắt đầu nội dung từ ${fileToProcess.name} ---\n${textContent}\n--- Kết thúc nội dung từ ${fileToProcess.name} ---`);
                    setProgress(fileProgressStart + fileProgressSpan);

                } else if (fileToProcess.type.startsWith('audio/')) {
                    const requiresProcessing = Object.values(processingOptions).some(v => v);
                    let audioProcessingProgressStart = fileProgressStart;
                    let audioProcessingProgressSpan = fileProgressSpan * 0.5;
                    
                    if (requiresProcessing) {
                        setStatusMessage(`(Tệp ${i + 1}/${selectedFiles.length}) Đang tối ưu hóa âm thanh...`);
                        const processingProgressUpdater = (processingProgress: number) => {
                           const progressInSpan = processingProgress / 100 * audioProcessingProgressSpan;
                           setProgress(fileProgressStart + progressInSpan);
                        };
                        fileToProcess = await processAudio(fileToProcess, processingOptions, processingProgressUpdater);
                        if (cancelRequestRef.current) return;
                        audioProcessingProgressStart += audioProcessingProgressSpan;
                    }

                    const transcriptionProgressStart = audioProcessingProgressStart;
                    const transcriptionProgressSpan = fileProgressSpan - (audioProcessingProgressStart - fileProgressStart);

                    setProgress(transcriptionProgressStart + transcriptionProgressSpan * 0.1);
                    setStatusMessage(`(Tệp ${i + 1}/${selectedFiles.length}) Đang gửi đến Gemini...`);

                    let intervalId: number | null = null;
                    try {
                        const progressTarget = transcriptionProgressStart + transcriptionProgressSpan * 0.9;
                        intervalId = window.setInterval(() => {
                            if (cancelRequestRef.current) {
                                if (intervalId) clearInterval(intervalId);
                                return;
                            }
                            setProgress(prev => {
                                if (prev >= progressTarget) {
                                    if (intervalId) clearInterval(intervalId);
                                    return prev;
                                }
                                const increment = Math.random() * 2;
                                return Math.min(prev + increment, progressTarget);
                            });
                        }, 400);

                        const result = await transcribeAudio(fileToProcess, selectedModel);
                        if (intervalId) clearInterval(intervalId);
                        if (cancelRequestRef.current) return;

                        setProgress(transcriptionProgressStart + transcriptionProgressSpan * 0.95);
                        setStatusMessage(`(Tệp ${i + 1}/${selectedFiles.length}) Đang hoàn tất...`);
                        await new Promise(res => setTimeout(res, 200));
                        if (cancelRequestRef.current) return;
                        
                        allContent.push(`--- Bắt đầu phiên âm từ ${fileToProcess.name} ---\n${result}\n--- Kết thúc phiên âm từ ${fileToProcess.name} ---`);
                        setProgress(fileProgressStart + fileProgressSpan);
                    } catch (e) {
                        if (intervalId) clearInterval(intervalId);
                        throw e; // re-throw to be caught by outer catch
                    }
                } else {
                     allContent.push(`--- Đã bỏ qua tệp không được hỗ trợ: ${fileToProcess.name} (loại: ${fileToProcess.type || 'không rõ'}) ---`);
                     setProgress(fileProgressStart + fileProgressSpan);
                }
            }

            setTranscription(allContent.join('\n\n'));
            setProgress(100);
            setStatusMessage('✅ Xử lý hoàn tất!');

        } catch (err) {
            if (cancelRequestRef.current) return;
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
            setError(errorMessage);
            setProgress(0);
            setStatusMessage('Đã xảy ra lỗi!');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFiles, selectedModel, processingOptions]);

    const handleGenerateMinutes = useCallback(async (details: MeetingDetails) => {
        const finalTranscription = mappedTranscription || transcription;
        if (!finalTranscription) {
            setMinutesError("Phải có văn bản phiên âm trước khi tạo biên bản.");
            return;
        }

        setIsGeneratingMinutes(true);
        cancelRequestRef.current = false;
        setMeetingMinutesHtml('');
        setMinutesError(null);
        setEditError(null);
        setLastMeetingDetails(details);

        setMinutesGenerationProgress(0);
        setMinutesGenerationStatus('Đang khởi tạo...');
        const intervalId = window.setInterval(() => {
            if (cancelRequestRef.current) {
                clearInterval(intervalId);
                return;
            }
            setMinutesGenerationProgress(prev => {
                const next = prev + Math.floor(Math.random() * 5) + 2;
                if (next >= 95) {
                    clearInterval(intervalId);
                    return 95;
                }
                if (next < 20) setMinutesGenerationStatus('Đang gửi văn bản đến AI...');
                else if (next < 70) setMinutesGenerationStatus('AI đang phân tích nội dung...');
                else setMinutesGenerationStatus('AI đang cấu trúc biên bản...');
                return next;
            });
        }, 600);


        try {
            const resultHtml = await generateMeetingMinutes(finalTranscription, details, selectedModel);
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;

            setMinutesGenerationProgress(100);
            setMinutesGenerationStatus('✅ Đã tạo biên bản!');
            await new Promise(res => setTimeout(res, 800));

            setMeetingMinutesHtml(resultHtml);
        } catch (err) {
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
            setMinutesError(errorMessage);
        } finally {
            clearInterval(intervalId);
            setIsGeneratingMinutes(false);
        }
    }, [transcription, mappedTranscription, selectedModel]);

    const handleRequestEdits = useCallback(async (editText: string) => {
        const finalTranscription = mappedTranscription || transcription;
        if (!finalTranscription || !meetingMinutesHtml || !lastMeetingDetails) {
            setEditError("Không thể yêu cầu chỉnh sửa nếu thiếu văn bản, biên bản đã tạo hoặc chi tiết cuộc họp.");
            return;
        }

        setIsEditingMinutes(true);
        cancelRequestRef.current = false;
        setEditError(null);
        setEditProgress(0);
        setEditStatusMessage('Đang khởi tạo chỉnh sửa...');

        const intervalId = window.setInterval(() => {
            if (cancelRequestRef.current) {
                clearInterval(intervalId);
                return;
            }
            setEditProgress(prev => {
                const next = prev + Math.floor(Math.random() * 6) + 3;
                if (next >= 95) {
                    clearInterval(intervalId);
                    return 95;
                }
                if (next < 30) setEditStatusMessage('AI đang đọc yêu cầu của bạn...');
                else if (next < 80) setEditStatusMessage('AI đang áp dụng các thay đổi...');
                else setEditStatusMessage('Đang hoàn tất phiên bản mới...');
                return next;
            });
        }, 500);


        try {
            const resultHtml = await regenerateMeetingMinutes(finalTranscription, lastMeetingDetails, meetingMinutesHtml, editText, selectedModel);
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;

            setEditProgress(100);
            setEditStatusMessage('✅ Đã áp dụng chỉnh sửa!');
            await new Promise(res => setTimeout(res, 800));

            setMeetingMinutesHtml(resultHtml);
        } catch (err) {
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
            setEditError(errorMessage);
        } finally {
            clearInterval(intervalId);
            setIsEditingMinutes(false);
        }
    }, [transcription, mappedTranscription, meetingMinutesHtml, selectedModel, lastMeetingDetails]);

    const getButtonText = () => {
        if (isLoading) return 'Đang xử lý...';
        const count = selectedFiles.length;
        if (count <= 1) return '▶️ Xử lý Tệp';
        return `▶️ Xử lý ${count} Tệp`;
    };

    const isBusy = isLoading || isGeneratingMinutes || isEditingMinutes;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                        Trợ lý Biên bản họp Gemini
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Chuyển văn bản từ audio hoặc sử dụng văn bản có sẵn để tạo biên bản họp chuyên nghiệp với AI.
                    </p>
                </header>
                
                <main className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-indigo-600 border-b border-gray-300 pb-2">1. Tải lên File</h2>
                            <FileUpload onFileSelect={handleFileSelect} disabled={isBusy} />
                        </div>
                        <div className="space-y-4">
                             <h2 className="text-lg font-semibold text-indigo-600 border-b border-gray-300 pb-2">2. Tùy chọn</h2>
                            <Options 
                                disabled={isBusy}
                                options={processingOptions}
                                onOptionChange={handleOptionChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-indigo-600 border-b border-gray-300 pb-2">3. Chọn Model</h2>
                        <ModelSelector 
                            initialModel={selectedModel}
                            onModelChange={setSelectedModel} 
                            disabled={isBusy}
                        />
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleProcessFile}
                            disabled={selectedFiles.length === 0 || isBusy}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            {getButtonText()}
                        </button>
                        {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
                    </div>
                    
                    {isLoading && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                             <h2 className="text-lg font-semibold text-indigo-600">4. Đang xử lý...</h2>
                            <div className="space-y-3">
                                <ProgressBar progress={progress} message={statusMessage} />
                                <div className="text-center">
                                    <button 
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-500 transition-all"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && transcription && (
                        <>
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h2 className="text-lg font-semibold text-indigo-600">4. Nội dung File / Văn bản</h2>
                                <SpeakerMapper
                                    originalTranscription={transcription}
                                    onMappingApplied={setMappedTranscription}
                                    disabled={isBusy}
                                />
                                <TranscriptionResult text={mappedTranscription || transcription} />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h2 className="text-lg font-semibold text-purple-600">5. Tạo Biên bản họp</h2>
                                {isGeneratingMinutes ? (
                                     <div className="text-center space-y-3 p-4 bg-gray-100 rounded-lg">
                                        <ProgressBar progress={minutesGenerationProgress} message={minutesGenerationStatus} />
                                        <button 
                                            onClick={handleCancel}
                                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-500 transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <MeetingMinutesGenerator 
                                            onSubmit={handleGenerateMinutes} 
                                            disabled={isGeneratingMinutes || isEditingMinutes}
                                        />
                                        {minutesError && <p className="text-red-500 mt-2 text-center font-semibold">{minutesError}</p>}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    
                    {!isGeneratingMinutes && meetingMinutesHtml && (
                        <>
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h2 className="text-lg font-semibold text-purple-600">6. Xem &amp; Tải Biên bản</h2>
                                <MeetingMinutesResult 
                                    htmlContent={meetingMinutesHtml}
                                    meetingDetails={lastMeetingDetails} 
                                />
                            </div>
                    
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h2 className="text-lg font-semibold text-green-600">7. Yêu cầu chỉnh sửa báo cáo</h2>
                                {isEditingMinutes ? (
                                    <div className="text-center space-y-3 p-4 bg-gray-100 rounded-lg">
                                        <ProgressBar progress={editProgress} message={editStatusMessage} />
                                        <button 
                                            onClick={handleCancel}
                                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <EditRequest
                                        onSubmit={handleRequestEdits}
                                        disabled={isEditingMinutes}
                                    />
                                )}
                                {editError && <p className="text-red-500 mt-2 text-center font-semibold">{editError}</p>}
                            </div>
                        </>
                    )}

                </main>
                 <footer className="text-center mt-8">
                    <a href="https://github.com/google/gemini-api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                        <GithubIcon className="w-5 h-5 mr-2" />
                        Powered by Google Gemini API
                    </a>
                </footer>
            </div>
        </div>
    );
};
