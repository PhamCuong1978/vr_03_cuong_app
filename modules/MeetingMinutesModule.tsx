
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

export const MeetingMinutesModule: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
    const [transcription, setTranscription] = useState<string>('');
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
            setStatusMessage('Processing cancelled by user.');
        }
        if (isGeneratingMinutes) {
            setIsGeneratingMinutes(false);
            setMinutesError('Minute generation cancelled by user.');
        }
        if (isEditingMinutes) {
            setIsEditingMinutes(false);
            setEditError('Edit request cancelled by user.');
        }
    };

    const handleProcessFile = useCallback(async () => {
        if (selectedFiles.length === 0) {
            setError("Please select one or more files first.");
            return;
        }

        setIsLoading(true);
        cancelRequestRef.current = false;
        setTranscription('');
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
                
                setStatusMessage(`Processing file ${i + 1}/${selectedFiles.length}: ${fileToProcess.name}`);

                if (fileToProcess.type.startsWith('text/')) {
                    setProgress(fileProgressStart + fileProgressSpan * 0.5);
                    await new Promise(res => setTimeout(res, 200)); // UI delay
                    if (cancelRequestRef.current) return;

                    const textContent = await fileToProcess.text();
                    if (cancelRequestRef.current) return;

                    allContent.push(`--- Start of content from ${fileToProcess.name} ---\n${textContent}\n--- End of content from ${fileToProcess.name} ---`);
                    setProgress(fileProgressStart + fileProgressSpan);

                } else if (fileToProcess.type.startsWith('audio/')) {
                    const requiresProcessing = Object.values(processingOptions).some(v => v);
                    let audioProcessingProgressStart = fileProgressStart;
                    let audioProcessingProgressSpan = fileProgressSpan * 0.5;
                    
                    if (requiresProcessing) {
                        setStatusMessage(`(File ${i + 1}/${selectedFiles.length}) Applying audio optimizations...`);
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
                    setStatusMessage(`(File ${i + 1}/${selectedFiles.length}) Sending to Gemini...`);

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
                        setStatusMessage(`(File ${i + 1}/${selectedFiles.length}) Finalizing...`);
                        await new Promise(res => setTimeout(res, 200));
                        if (cancelRequestRef.current) return;
                        
                        allContent.push(`--- Start of transcription from ${fileToProcess.name} ---\n${result}\n--- End of transcription from ${fileToProcess.name} ---`);
                        setProgress(fileProgressStart + fileProgressSpan);
                    } catch (e) {
                        if (intervalId) clearInterval(intervalId);
                        throw e; // re-throw to be caught by outer catch
                    }
                } else {
                     allContent.push(`--- Skipped unsupported file: ${fileToProcess.name} (type: ${fileToProcess.type || 'unknown'}) ---`);
                     setProgress(fileProgressStart + fileProgressSpan);
                }
            }

            setTranscription(allContent.join('\n\n'));
            setProgress(100);
            setStatusMessage('✅ Processing complete!');

        } catch (err) {
            if (cancelRequestRef.current) return;
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Processing failed: ${errorMessage}`);
            setProgress(0);
            setStatusMessage('Error!');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFiles, selectedModel, processingOptions]);

    const handleGenerateMinutes = useCallback(async (details: MeetingDetails) => {
        if (!transcription) {
            setMinutesError("A transcription must exist before generating minutes.");
            return;
        }

        setIsGeneratingMinutes(true);
        cancelRequestRef.current = false;
        setMeetingMinutesHtml('');
        setMinutesError(null);
        setEditError(null);
        setLastMeetingDetails(details);

        setMinutesGenerationProgress(0);
        setMinutesGenerationStatus('Initializing...');
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
                if (next < 20) setMinutesGenerationStatus('Sending transcription to AI...');
                else if (next < 70) setMinutesGenerationStatus('AI is analyzing the content...');
                else setMinutesGenerationStatus('AI is structuring the minutes...');
                return next;
            });
        }, 600);


        try {
            const resultHtml = await generateMeetingMinutes(transcription, details, selectedModel);
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;

            setMinutesGenerationProgress(100);
            setMinutesGenerationStatus('✅ Minutes generated!');
            await new Promise(res => setTimeout(res, 800));

            setMeetingMinutesHtml(resultHtml);
        } catch (err) {
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setMinutesError(`Failed to generate minutes: ${errorMessage}`);
        } finally {
            clearInterval(intervalId);
            setIsGeneratingMinutes(false);
        }
    }, [transcription, selectedModel]);

    const handleRequestEdits = useCallback(async (editText: string) => {
        if (!transcription || !meetingMinutesHtml || !lastMeetingDetails) {
            setEditError("Cannot request edits without an existing transcription, generated minutes, and meeting details.");
            return;
        }

        setIsEditingMinutes(true);
        cancelRequestRef.current = false;
        setEditError(null);
        setEditProgress(0);
        setEditStatusMessage('Initializing edit...');

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
                if (next < 30) setEditStatusMessage('AI is reading your request...');
                else if (next < 80) setEditStatusMessage('AI is applying the changes...');
                else setEditStatusMessage('Finalizing the new version...');
                return next;
            });
        }, 500);


        try {
            const resultHtml = await regenerateMeetingMinutes(transcription, lastMeetingDetails, meetingMinutesHtml, editText, selectedModel);
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;

            setEditProgress(100);
            setEditStatusMessage('✅ Edits applied successfully!');
            await new Promise(res => setTimeout(res, 800));

            setMeetingMinutesHtml(resultHtml);
        } catch (err) {
            clearInterval(intervalId);
            if (cancelRequestRef.current) return;
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setEditError(`Failed to edit minutes: ${errorMessage}`);
        } finally {
            clearInterval(intervalId);
            setIsEditingMinutes(false);
        }
    }, [transcription, meetingMinutesHtml, selectedModel, lastMeetingDetails]);

    const getButtonText = () => {
        if (isLoading) return 'Processing...';
        const count = selectedFiles.length;
        if (count <= 1) return '▶️ Process File';
        return `▶️ Process ${count} Files`;
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
                        {error && <p className="text-red-500 mt-4">{error}</p>}
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
                                <TranscriptionResult text={transcription} />
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
                                        {minutesError && <p className="text-red-500 mt-2 text-center">{minutesError}</p>}
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
                                {editError && <p className="text-red-500 mt-2 text-center">{editError}</p>}
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
