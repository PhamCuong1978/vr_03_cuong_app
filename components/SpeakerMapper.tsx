import React, { useState, useEffect, useMemo } from 'react';

interface SpeakerMapperProps {
    originalTranscription: string;
    onMappingApplied: (newTranscription: string) => void;
    disabled: boolean;
}

export const SpeakerMapper: React.FC<SpeakerMapperProps> = ({ originalTranscription, onMappingApplied, disabled }) => {
    const [isEditing, setIsEditing] = useState(true);
    
    const detectedSpeakers = useMemo(() => {
        const speakerRegex = /(Người nói \d+):/g;
        const matches = originalTranscription.match(speakerRegex) || [];
        // Use a Set to get unique speaker labels, then convert back to an array and sort
        // Fix: Explicitly type sort callback parameters as string to resolve TS error.
        return Array.from(new Set(matches.map(m => m.replace(':', '')))).sort((a: string, b: string) => {
            const numA = parseInt(a.split(' ')[2]);
            const numB = parseInt(b.split(' ')[2]);
            return numA - numB;
        });
    }, [originalTranscription]);
    
    const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({});

    useEffect(() => {
        // Initialize speakerMap with detected speakers
        const initialMap: Record<string, string> = {};
        detectedSpeakers.forEach(speaker => {
            initialMap[speaker] = '';
        });
        setSpeakerMap(initialMap);
        setIsEditing(true); // Reset to editing mode when transcription changes
    }, [detectedSpeakers]);

    const handleNameChange = (speaker: string, newName: string) => {
        setSpeakerMap(prev => ({
            ...prev,
            [speaker]: newName,
        }));
    };

    const handleApply = () => {
        let newTranscription = originalTranscription;
        // Iterate in reverse order of speaker number to avoid replacing "Người nói 10" before "Người nói 1"
        const sortedSpeakers = [...detectedSpeakers].sort((a, b) => {
            const numA = parseInt(a.split(' ')[2]);
            const numB = parseInt(b.split(' ')[2]);
            return numB - numA;
        });

        for (const speaker of sortedSpeakers) {
            const newName = speakerMap[speaker];
            if (newName && newName.trim() !== '') {
                // Use a regex to replace all occurrences of the speaker label, escaping special characters
                const regex = new RegExp(speaker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':', 'g');
                newTranscription = newTranscription.replace(regex, `${newName.trim()}:`);
            }
        }
        onMappingApplied(newTranscription);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    if (detectedSpeakers.length === 0) {
        return null; // Don't render if no speakers were detected
    }

    if (!isEditing) {
        return (
             <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-md font-semibold text-gray-800">Tên người nói đã được áp dụng.</h3>
                        <p className="text-sm text-gray-500">Nội dung văn bản bên dưới đã được cập nhật.</p>
                    </div>
                    <button
                        onClick={handleEdit}
                        disabled={disabled}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        Chỉnh sửa lại
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4 mb-4">
            <h3 className="text-md font-semibold text-gray-800">Gán tên cho người nói</h3>
            <p className="text-sm text-gray-500">Nhập tên tương ứng cho các nhãn người nói được phát hiện bên dưới. Bỏ trống nếu bạn muốn giữ nguyên nhãn gốc.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {detectedSpeakers.map(speaker => (
                    <div key={speaker}>
                        <label htmlFor={`speaker-${speaker}`} className="block text-sm font-medium text-gray-700 mb-1">
                            {speaker}
                        </label>
                        <input
                            type="text"
                            id={`speaker-${speaker}`}
                            value={speakerMap[speaker] || ''}
                            onChange={(e) => handleNameChange(speaker, e.target.value)}
                            disabled={disabled}
                            placeholder="Nhập tên..."
                            className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                ))}
            </div>
            <div className="text-center pt-2">
                 <button
                    onClick={handleApply}
                    disabled={disabled}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Áp dụng tên
                </button>
            </div>
        </div>
    );
};

export default SpeakerMapper;