import React from 'react';

interface ModelSelectorProps {
    onModelChange: (model: string) => void;
    disabled: boolean;
    initialModel: string;
}

const models = [
    { id: 'gemini-2.5-flash', name: 'Flash (Nhanh & Hiệu quả)' },
    { id: 'gemini-2.5-pro', name: 'Pro (Chất lượng cao nhất)' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelChange, disabled, initialModel }) => {
    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn model AI. "Pro" cho độ chính xác cao hơn nhưng có thể chậm hơn.
            </label>
            <select
                id="model-select"
                value={initialModel}
                onChange={(e) => onModelChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {models.map(model => (
                    <option key={model.id} value={model.id}>
                        {model.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ModelSelector;
