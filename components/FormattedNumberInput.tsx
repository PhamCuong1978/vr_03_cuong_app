
import React from 'react';
import { VoiceInputButton } from './VoiceInputButton';
import { parseTranscriptToNumber } from '../utils/transcriptParser';

export const FormattedNumberInput: React.FC<{
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  decimalPlaces?: number;
  addon?: React.ReactNode;
  srOnlyLabel?: boolean;
  enableVoice?: boolean;
}> = ({ value, onChange, onCommit, id, label, decimalPlaces = 0, addon, srOnlyLabel, enableVoice = false }) => {
  const format = (num: number | string) => {
    // For USD, use comma for decimal, but Intl.NumberFormat handles it based on locale 'vi-VN'
    const numericValue = typeof num === 'string' ? parseFloat(num.replace(',', '.')) : num;
    if (numericValue === null || numericValue === undefined || isNaN(numericValue)) return '';
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(numericValue);
  };
  
  const [displayValue, setDisplayValue] = React.useState(format(value));
  const isFocused = React.useRef(false);

  React.useEffect(() => {
    if (!isFocused.current) {
      setDisplayValue(format(value));
    }
  }, [value, decimalPlaces]);

  const handleFocus = () => {
    isFocused.current = true;
    // Show a clean number for editing. Use comma for decimals to be more natural for vi-VN locale.
    setDisplayValue(value === 0 ? '' : String(value).replace('.', ','));
  };

  const handleBlur = () => {
    isFocused.current = false;
    setDisplayValue(format(value));
    if (onCommit) {
      onCommit(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);

    if (rawValue.trim() === '' || rawValue.trim() === '-') {
      onChange(0);
      return;
    }

    // Allow typing comma for decimal, but clean it for parsing
    // Replace all dots (thousand separators) and then replace comma (decimal) with a dot for parseFloat
    const cleanedValue = rawValue.replace(/\./g, '').replace(',', '.');
    
    // Regex allows numbers, optional minus sign, and one optional decimal point
    if (/^-?\d*\.?\d*$/.test(cleanedValue)) {
      const num = parseFloat(cleanedValue);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };
  
  const handleTranscript = (transcript: string) => {
    const num = parseTranscriptToNumber(transcript);
    if (num !== null) {
      onChange(num);
      // Also commit the value immediately after voice input for a better UX
      if (onCommit) {
        onCommit(num);
      }
      // The useEffect will handle updating the display value
    }
  };

  return (
     <div>
      <label htmlFor={id} className={srOnlyLabel ? "sr-only" : "block text-sm font-medium text-gray-700 mb-1"}>
        {label}
      </label>
      <div className="flex rounded-md shadow-sm">
        <div className="relative flex-grow">
          <input
            id={id}
            type="text"
            inputMode={decimalPlaces > 0 ? 'decimal' : 'numeric'}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border border-gray-300 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${addon ? 'rounded-none rounded-l-md' : 'rounded-md'} ${enableVoice ? 'pr-10' : ''}`}
          />
          {enableVoice && (
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <VoiceInputButton onTranscript={handleTranscript} />
            </div>
          )}
        </div>
        {addon && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            {addon}
          </span>
        )}
      </div>
    </div>
  );
};
