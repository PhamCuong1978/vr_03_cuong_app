
import React from 'react';
import { CogIcon } from './icons/CogIcon';
import { FormattedNumberInput } from './FormattedNumberInput';

interface SettingsPanelProps {
  exchangeRateImport: number;
  setExchangeRateImport: (value: number) => void;
  exchangeRateTax: number;
  setExchangeRateTax: (value: number) => void;
  salesSalaryRate: number;
  setSalesSalaryRate: (value: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  exchangeRateImport,
  setExchangeRateImport,
  exchangeRateTax,
  setExchangeRateTax,
  salesSalaryRate,
  setSalesSalaryRate,
}) => {

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4 flex items-center">
        <CogIcon className="h-5 w-5 mr-2 text-gray-500" />
        Cài đặt chung
      </h3>
      <div className="space-y-4">
        <FormattedNumberInput
          label="Tỷ giá USD/VNĐ (nhập khẩu)"
          value={exchangeRateImport}
          onChange={setExchangeRateImport}
          id="exchangeRateImport"
          enableVoice
        />
        <FormattedNumberInput
          label="Tỷ giá USD/VNĐ (tính thuế)"
          value={exchangeRateTax}
          onChange={setExchangeRateTax}
          id="exchangeRateTax"
          enableVoice
        />
        <FormattedNumberInput
          label="Tỷ lệ lương NV bán hàng"
          value={salesSalaryRate}
          onChange={setSalesSalaryRate}
          decimalPlaces={2}
          id="salesSalaryRate"
          addon="%"
          enableVoice
        />
      </div>
    </div>
  );
};
