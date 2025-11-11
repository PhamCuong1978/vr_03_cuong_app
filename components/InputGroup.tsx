import React from 'react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  srOnlyLabel?: boolean;
  addon?: React.ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, id, srOnlyLabel = false, addon, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className={srOnlyLabel ? "sr-only" : "block text-sm font-medium text-gray-700 mb-1"}>
        {label}
      </label>
      <div className="flex rounded-md shadow-sm">
        <input
          id={id}
          {...props}
          className={`w-full px-3 py-2 border border-gray-300 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${addon ? 'rounded-l-md' : 'rounded-md'}`}
        />
        {addon && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            {addon}
          </span>
        )}
      </div>
    </div>
  );
};
