
import React from 'react';
import type { PlanItem } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface PlanSummaryProps {
  items: PlanItem[];
}

export const PlanSummary: React.FC<PlanSummaryProps> = ({ items }) => {
  const totals = items.reduce(
    (acc, item) => {
      acc.totalCOGS += item.calculated.totalCOGS || 0;
      acc.totalSellingCost += item.calculated.totalSellingCost || 0;
      acc.totalGaCost += item.calculated.totalGaCost || 0;
      acc.totalFinancialCost += item.calculated.totalFinancialCost || 0;
      acc.totalRevenue += item.calculated.totalRevenue || 0;
      acc.grossProfit += item.calculated.grossProfit || 0;
      acc.profitBeforeTax += item.calculated.profitBeforeTax || 0;
      acc.corporateIncomeTax += item.calculated.corporateIncomeTax || 0;
      acc.importVAT += item.calculated.importVAT || 0;
      acc.outputVAT += item.calculated.outputVAT || 0;
      acc.vatPayable += item.calculated.vatPayable || 0;
      acc.netProfit += item.calculated.netProfit || 0;
      acc.totalTaxPayable += item.calculated.totalTaxPayable || 0;
      return acc;
    },
    {
      totalCOGS: 0,
      totalSellingCost: 0,
      totalGaCost: 0,
      totalFinancialCost: 0,
      totalRevenue: 0,
      grossProfit: 0,
      profitBeforeTax: 0,
      corporateIncomeTax: 0,
      importVAT: 0,
      outputVAT: 0,
      vatPayable: 0,
      netProfit: 0,
      totalTaxPayable: 0,
    }
  );

  const totalNetProfitMargin = totals.totalRevenue > 0 ? (totals.netProfit / totals.totalRevenue) * 100 : 0;

  return (
    <tfoot className="bg-gray-100 font-bold">
      <tr>
        <td colSpan={3} className="pl-4 pr-2 py-3 text-left text-sm text-gray-800 uppercase tracking-wider">Tổng cộng</td>
        <td className="px-3 py-3 text-left text-sm text-green-800">{formatCurrency(totals.totalRevenue)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.totalCOGS)}</td>
        <td className="px-3 py-3 text-left text-sm text-blue-800">{formatCurrency(totals.grossProfit)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.totalSellingCost)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.totalGaCost)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.totalFinancialCost)}</td>
        <td className="px-3 py-3 text-left text-sm text-purple-800">{formatCurrency(totals.profitBeforeTax)}</td>
        <td className="px-3 py-3 text-left text-sm text-red-800">{formatCurrency(totals.corporateIncomeTax)}</td>
        <td className={`px-3 py-3 text-left text-sm ${totals.netProfit < 0 ? 'text-red-700' : 'text-green-700'}`}>{formatCurrency(totals.netProfit)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.importVAT)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.outputVAT)}</td>
        <td className="px-3 py-3 text-left text-sm text-gray-700">{formatCurrency(totals.vatPayable)}</td>
        <td className="px-3 py-3 text-left text-sm text-red-800">{formatCurrency(totals.totalTaxPayable)}</td>
        <td className={`px-3 py-3 text-left text-sm ${totalNetProfitMargin < 0 ? 'text-red-700' : 'text-blue-800'}`}>{formatPercentage(totalNetProfitMargin)}</td>
      </tr>
    </tfoot>
  );
};
