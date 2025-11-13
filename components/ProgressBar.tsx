import React from 'react';

interface ProgressBarProps {
    progress: number;
    message: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
    // Ensure progress is within 0-100 range
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{message}</p>
                 <p className="text-sm font-semibold text-indigo-600">{clampedProgress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${clampedProgress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
