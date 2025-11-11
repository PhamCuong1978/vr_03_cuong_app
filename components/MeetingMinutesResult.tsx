import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import type { MeetingDetails } from '../types';

interface MeetingMinutesResultProps {
    htmlContent: string;
    meetingDetails: MeetingDetails | null;
}

const MeetingMinutesResult: React.FC<MeetingMinutesResultProps> = ({ htmlContent, meetingDetails }) => {
    
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
                // Sanitize for filename: remove accents, special characters, and replace spaces with underscores.
                location = potentialLocation
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                    .replace(/đ/g, "d").replace(/Đ/g, "D") // Handle 'đ' character
                    .replace(/[^a-zA-Z0-9-]/g, '_') // Replace non-alphanumeric with underscore
                    .replace(/_+/g, '_'); // Collapse multiple underscores
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
        // Do not revoke the URL immediately, as the new tab needs time to load it.
    };

    return (
        <div className="relative bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
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
        </div>
    );
};

export default MeetingMinutesResult;
