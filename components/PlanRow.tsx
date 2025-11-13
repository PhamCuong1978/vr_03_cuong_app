
import React, { useState } from 'react';
import type { PlanItem } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { PlanItemDetails } from './PlanItemDetails';

interface PlanRowProps {
  item: PlanItem;
  index: number;
  updateItem: (id: string, field: string, value: number) => void;
  removeItem: (id: string) => void;
  planTotals: { totalGrossProfit: number; totalQuantityInKg: number; };
  salesSalaryRate: number;
  setSalesSalaryRate: (value: number) => void;
  totalMonthlyIndirectSalary: number;
  setTotalMonthlyIndirectSalary: (value: number) => void;
  workingDaysPerMonth: number;
  setWorkingDaysPerMonth: (value: number) => void;
  totalMonthlyRent: number;
  setTotalMonthlyRent: (value: number) => void;
  totalMonthlyElectricity: number;
  setTotalMonthlyElectricity: (value: number) => void;
  totalMonthlyWater: number;
  setTotalMonthlyWater: (value: number) => void;
  totalMonthlyStationery: number;
  setTotalMonthlyStationery: (value: number) => void;
  totalMonthlyDepreciation: number;
  setTotalMonthlyDepreciation: (value: number) => void;
  totalMonthlyExternalServices: number;
  setTotalMonthlyExternalServices: (value: number) => void;
  totalMonthlyOtherCashExpenses: number;
  setTotalMonthlyOtherCashExpenses: (value: number) => void;
  totalMonthlyFinancialCost: number;
  setTotalMonthlyFinancialCost: (value: number) => void;
}

export const PlanRow: React.FC<PlanRowProps> = (props) => {
  const { item, removeItem, index } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const { code, nameVI, brand, group, calculated } = item;
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row from toggling when deleting
    removeItem(item.id);
  }

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="pl-4 pr-2 py-4 align-top">
          <div className="flex items-start space-x-2">
            <button onClick={handleRemove} className="text-gray-400 hover:text-red-600 flex-shrink-0 mt-1">
              <TrashIcon className="h-5 w-5" />
            </button>
            <div className="text-gray-400 mt-1">
              {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
            </div>
          </div>
        </td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 align-top text-center">{index + 1}</td>
        <td className="px-3 py-4 whitespace-nowrap align-top">
          <div className="text-sm font-medium text-gray-900">{`${code} - ${group} - ${nameVI}`}</div>
          <div className="text-sm text-gray-500">{brand}</div>
        </td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-green-700 align-top">{formatCurrency(calculated.totalRevenue)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 align-top">{formatCurrency(calculated.totalCOGS)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-blue-700 font-medium align-top">{formatCurrency(calculated.grossProfit)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 align-top">{formatCurrency(calculated.totalSellingCost)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 align-top">{formatCurrency(calculated.totalGaCost)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 align-top">{formatCurrency(calculated.totalFinancialCost)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-purple-700 font-medium align-top">{formatCurrency(calculated.profitBeforeTax)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-red-700 align-top">{formatCurrency(calculated.corporateIncomeTax)}</td>
        <td className={`px-3 py-4 whitespace-nowrap text-sm font-bold align-top ${(calculated.netProfit ?? 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(calculated.netProfit)}
        </td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 align-top">{formatCurrency(calculated.importVAT)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 align-top">{formatCurrency(calculated.outputVAT)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 font-medium align-top">{formatCurrency(calculated.vatPayable)}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-red-700 font-bold align-top">{formatCurrency(calculated.totalTaxPayable)}</td>
        <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium align-top ${(calculated.netProfitMargin ?? 0) < 0 ? 'text-red-600' : 'text-blue-700'}`}>
          {formatPercentage(calculated.netProfitMargin)}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={17} className="p-0">
             <PlanItemDetails {...props} />
          </td>
        </tr>
      )}
    </>
  );
};
