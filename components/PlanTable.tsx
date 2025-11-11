
import React from 'react';
import type { PlanItem } from '../types';
import { PlanRow } from './PlanRow';
import { PlanSummary } from './PlanSummary';

interface PlanTableProps {
  items: PlanItem[];
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

const tableHeaders = [
  "STT", "Sản phẩm", "Doanh thu", "Giá vốn", "CP Vận hành & kho", "Lợi nhuận gộp", "CP Bán hàng", "CP Quản lý", "CP Tài chính",
  "Lợi nhuận trước thuế", "Thuế TNDN", "Lãi ròng", "Thuế GTGT Mua vào", "Thuế GTGT Bán ra", "Thuế GTGT Phải nộp", "Tổng thuế phải nộp"
];

export const PlanTable: React.FC<PlanTableProps> = (props) => {
  const { items, updateItem, removeItem, planTotals } = props;
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12 pl-4 pr-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              {tableHeaders.map((header) => (
                <th key={header} scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <PlanRow 
                key={item.id} 
                item={item} 
                index={index}
                updateItem={updateItem} 
                removeItem={removeItem} 
                planTotals={planTotals}
                {...props}
              />
            ))}
          </tbody>
          <PlanSummary items={items} />
        </table>
      </div>
    </div>
  );
};
