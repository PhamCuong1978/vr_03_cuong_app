
import React from 'react';
import type { AudioProcessingOptions } from '../utils/audioProcessor';

interface OptionsProps {
    disabled: boolean;
    options: AudioProcessingOptions;
    onOptionChange: (option: keyof AudioProcessingOptions, value: boolean) => void;
}

const OptionCheckbox: React.FC<{ 
    label: string; 
    disabled: boolean; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
}> = ({ label, disabled, checked, onChange }) => (
    <label className={`flex items-center space-x-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
        <input 
            type="checkbox"
            className="form-checkbox h-4 w-4 bg-gray-100 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
            disabled={disabled}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-gray-700 text-sm">{label}</span>
    </label>
);

const Options: React.FC<OptionsProps> = ({ disabled, options, onOptionChange }) => {
    return (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg h-full">
            <p className="text-xs text-gray-500 mb-2">Các tùy chọn này giúp cải thiện độ chính xác phiên âm cho file audio.</p>
            <OptionCheckbox 
                label="Chuyển sang mono & 16kHz" 
                disabled={disabled} 
                checked={options.convertToMono16k} 
                onChange={(checked) => onOptionChange('convertToMono16k', checked)}
            />
            <OptionCheckbox 
                label="Áp dụng giảm nhiễu" 
                disabled={disabled} 
                checked={options.noiseReduction} 
                onChange={(checked) => onOptionChange('noiseReduction', checked)}
            />
            <OptionCheckbox 
                label="Chuẩn hóa âm lượng" 
                disabled={disabled} 
                checked={options.normalizeVolume} 
                onChange={(checked) => onOptionChange('normalizeVolume', checked)}
            />
            <OptionCheckbox 
                label="Loại bỏ khoảng lặng" 
                disabled={disabled} 
                checked={options.removeSilence} 
                onChange={(checked) => onOptionChange('removeSilence', checked)}
            />
        </div>
    );
};

export default Options;
