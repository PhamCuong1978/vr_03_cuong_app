
import type { PlanItem } from '../types';
import { formatCurrency } from './formatters';

const calculateTotals = (items: PlanItem[]) => {
  return items.reduce(
    (acc, item) => {
      acc.importValueVND += item.calculated.importValueVND || 0;
      acc.totalClearanceAndLogisticsCost += item.calculated.totalClearanceAndLogisticsCost || 0;
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
      acc.importInterestCost += item.calculated.importInterestCost || 0;
      // FIX: Add totalCOGS to the accumulator
      acc.totalCOGS += item.calculated.totalCOGS || 0;
      acc.totalTaxPayable += item.calculated.totalTaxPayable || 0;
      return acc;
    },
    {
      importValueVND: 0,
      totalClearanceAndLogisticsCost: 0,
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
      importInterestCost: 0,
      // FIX: Initialize totalCOGS in the accumulator
      totalCOGS: 0,
      totalTaxPayable: 0,
    }
  );
};

const createDetailRow = (label: string, value: string, isSubtle = false) => `
  <div class="flex justify-between py-2 border-b border-gray-200">
    <span class="text-sm ${isSubtle ? 'text-gray-500' : 'text-gray-600'}">${label}</span>
    <span class="text-sm font-semibold text-gray-800 text-right">${value}</span>
  </div>
`;

const createBoldDetailRow = (label: string, value: string) => `
  <div class="flex justify-between py-2 border-b-2 border-gray-400">
    <span class="text-sm font-bold text-gray-800">${label}</span>
    <span class="text-sm font-bold text-gray-900 text-right">${value}</span>
  </div>
`;

const createSummaryTableRow = (
  label: string, 
  code: string,
  formula: string,
  amount: number | null, 
  baseAmount: number, 
  isBold = false, 
  isSubItem = false
) => {
  const amountStr = amount !== null ? formatCurrency(amount) : '';
  const percentageStr = baseAmount !== 0 && amount !== null ? `${(amount / baseAmount * 100).toFixed(2)}%` : '';
  const paddingClass = isSubItem ? 'pl-8' : 'pl-4';
  const fontWeightClass = isBold ? 'font-bold' : '';

  return `
    <tr class="border-b">
      <td class="py-3 ${paddingClass} pr-2 text-sm text-gray-800 ${fontWeightClass}">${label}</td>
      <td class="py-3 px-2 text-center text-sm text-gray-600">${code}</td>
      <td class="py-3 px-2 text-center text-sm text-gray-600">${formula}</td>
      <td class="py-3 px-4 text-right text-sm text-gray-900 ${fontWeightClass}">${amountStr}</td>
      <td class="py-3 pl-2 pr-4 text-right text-sm text-gray-500">${percentageStr}</td>
    </tr>
  `;
};


export const generateHtmlReport = (items: PlanItem[], importRate: number, taxRate: number, analysisHtml?: string): string => {
  const totals = calculateTotals(items);
  const totalNetProfitMargin = totals.totalRevenue > 0 ? (totals.netProfit / totals.totalRevenue) * 100 : 0;
  const generationDate = new Date().toLocaleString('vi-VN');

  // Calculate metrics based on the new summary report format
  const grossRevenue = totals.totalRevenue; // Row 01
  const revenueDeductions = 0; // Row 02 (New item)
  const vatPayable = totals.vatPayable; // For new row 17

  const netRevenue = grossRevenue - revenueDeductions; // Row 10 = 01 - 02
  const cogs = totals.totalCOGS; // Row 11
  const grossProfit = netRevenue - cogs; // Row 20 = 10 - 11

  const financialIncome = 0; // Row 21
  const financialCost = totals.totalFinancialCost; // Row 22
  const interestInCogs = totals.importInterestCost; // Row 23
  const sellingCost = totals.totalSellingCost; // Row 25
  const gaCost = totals.totalGaCost; // Row 26
  
  // Per formula in image: 30 = 20 + (21-22) – 25 – 26
  const netOperatingProfit = grossProfit + (financialIncome - financialCost) - sellingCost - gaCost; // Row 30

  const otherIncome = 0; // Row 31
  const otherCost = 0; // Row 32
  const otherProfit = otherIncome - otherCost; // Row 40

  // Per formula in image: 50 = 30 + 40
  const pbt = netOperatingProfit + otherProfit; // Row 50
  
  // Per formula in image: 20% of 50
  const cit = pbt * 0.20; // Row 51
  
  const deferredCit = 0; // Row 52
  
  // Per formula in image: 60 = 50 - 51 - 52
  const summaryNetProfit = pbt - cit - deferredCit; // Row 60
  const totalTaxToPay = cit + vatPayable;

  const summarySection = `
    <div class="mb-12 break-after-page">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">PHƯƠNG ÁN KINH DOANH</h1>
        <p class="text-gray-600">Đơn vị tính: VND</p>
      </div>
      
      <div class="overflow-hidden border rounded-lg">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b">
              <th class="py-3 pl-4 pr-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/2">Chỉ tiêu</th>
              <th class="py-3 px-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Mã số</th>
              <th class="py-3 px-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Chi tiết lấy dữ liệu</th>
              <th class="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Số tiền</th>
              <th class="py-3 pl-2 pr-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            ${createSummaryTableRow('1. Doanh thu bán hàng và cung cấp dịch vụ', '01', 'Tổng hợp', grossRevenue, netRevenue, true)}
            ${createSummaryTableRow('2. Các khoản giảm trừ doanh thu', '02', '', revenueDeductions, netRevenue, false)}
            ${createSummaryTableRow('3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10 = 01 - 02)', '10', '[01] - [02]', netRevenue, netRevenue, false)}
            ${createSummaryTableRow('4. Giá vốn hàng bán', '11', 'Tổng hợp', cogs, netRevenue, true)}
            ${createSummaryTableRow('5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20 = 10 - 11)', '20', '[10] - [11]', grossProfit, netRevenue, true)}
            ${createSummaryTableRow('6. Doanh thu hoạt động tài chính', '21', '', financialIncome, netRevenue, false)}
            ${createSummaryTableRow('7. Chi phí tài chính', '22', 'Tổng hợp', financialCost, netRevenue, false)}
            ${createSummaryTableRow('8. Chi phí lãi vay đã tính vào giá vốn', '23', 'Tổng hợp', interestInCogs, netRevenue, false, true)}
            ${createSummaryTableRow('9. Chi phí bán hàng', '25', 'Tổng hợp', sellingCost, netRevenue, false)}
            ${createSummaryTableRow('10. Chi phí quản lý doanh nghiệp', '26', 'Tổng hợp', gaCost, netRevenue, false)}
            ${createSummaryTableRow('11. Lợi nhuận thuần từ hoạt động kinh doanh (30 = 20 + (21 - 22) – 25 – 26)', '30', '[20] + ([21]-[22]) - [25] - [26]', netOperatingProfit, netRevenue, true)}
            ${createSummaryTableRow('12. Thu nhập khác', '31', '', otherIncome, netRevenue, false)}
            ${createSummaryTableRow('13. Chi phí khác', '32', '', otherCost, netRevenue, false)}
            ${createSummaryTableRow('14. Lợi nhuận khác (40 = 31 - 32)', '40', '[31] - [32]', otherProfit, netRevenue, false)}
            ${createSummaryTableRow('15. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)', '50', '[30] + [40]', pbt, netRevenue, true)}
            ${createSummaryTableRow('16. Chi phí thuế TNDN hiện hành (20% x 50)', '51', '[50] x 20%', cit, netRevenue, false)}
            ${createSummaryTableRow('17. Chi phí thuế TNDN hoãn lại', '52', '', deferredCit, netRevenue, false)}
            ${createSummaryTableRow('18. Lợi nhuận sau thuế thu nhập doanh nghiệp (60 = 50 - 51 - 52)', '60', '[50] - [51] - [52]', summaryNetProfit, netRevenue, true)}
            ${createSummaryTableRow('19. Thuế GTGT phải nộp nhà nước', '70', 'Tổng hợp', vatPayable, netRevenue, false)}
            ${createSummaryTableRow('20. Tổng thuế phải nộp cho nhà nước', '80', '[51] + [70]', totalTaxToPay, netRevenue, true)}
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-start mt-12">
        <p class="text-gray-600 text-sm italic">Ngày tạo báo cáo: ${generationDate}</p>
        <div class="text-center w-64">
            <p class="font-bold text-gray-800">Người lập báo cáo</p>
            <p class="italic text-sm text-gray-600 mb-12">(Ký, họ tên)</p>
        </div>
      </div>
    </div>
  `;

  // --- START: New Cost Summary Section ---
  const costTotals = items.reduce((acc, item) => {
    const costs = item.userInput.costs;
    const calculated = item.calculated;

    // Category 1: Clearance & Logistics
    acc.customsFee += costs.customsFee || 0;
    acc.quarantineFee += costs.quarantineFee || 0;
    acc.containerRentalFee += costs.containerRentalFee || 0;
    acc.portStorageFee += costs.portStorageFee || 0;
    acc.generalWarehouseCost += calculated.generalWarehouseCost || 0;
    acc.importInterestCost += calculated.importInterestCost || 0;
    acc.postClearanceStorageCost += calculated.postClearanceStorageCost || 0;
    acc.purchasingServiceFee += calculated.purchasingServiceFee || 0;
    acc.buyerDeliveryFee += costs.buyerDeliveryFee || 0;
    acc.otherInternationalPurchaseCost += calculated.otherInternationalPurchaseCost || 0;
    
    // Category 2: Selling
    acc.salesStaffSalary += calculated.salesStaffSalary || 0;
    acc.otherSellingCosts += costs.otherSellingCosts || 0;

    // Category 3: G&A
    acc.indirectStaffSalary += calculated.indirectStaffSalary || 0;
    acc.rent += calculated.rent || 0;
    acc.electricity += calculated.electricity || 0;
    acc.water += calculated.water || 0;
    acc.stationery += calculated.stationery || 0;
    acc.depreciation += calculated.depreciation || 0;
    acc.externalServices += calculated.externalServices || 0;
    acc.otherCashExpenses += calculated.otherCashExpenses || 0;
    
    // Category 4: Financial
    acc.financialValuationCost += calculated.financialValuationCost || 0;
    
    return acc;
  }, {
      // Category 1
      customsFee: 0,
      quarantineFee: 0,
      containerRentalFee: 0,
      portStorageFee: 0,
      generalWarehouseCost: 0,
      importInterestCost: 0,
      postClearanceStorageCost: 0,
      purchasingServiceFee: 0,
      buyerDeliveryFee: 0,
      otherInternationalPurchaseCost: 0,
      // Category 2
      salesStaffSalary: 0,
      otherSellingCosts: 0,
      // Category 3
      indirectStaffSalary: 0,
      rent: 0,
      electricity: 0,
      water: 0,
      stationery: 0,
      depreciation: 0,
      externalServices: 0,
      otherCashExpenses: 0,
      // Category 4
      financialValuationCost: 0,
  });

  const totalClearanceAndLogistics = totals.totalClearanceAndLogisticsCost;
  const totalCost = totalClearanceAndLogistics + sellingCost + gaCost + financialCost;

  const avgPostClearanceStorageDays = items.length > 0
      ? items.reduce((sum, item) => sum + item.userInput.costs.postClearanceStorageDays, 0) / items.length
      : 0;
  const storageDaysNote = `(Lưu kho ~${avgPostClearanceStorageDays.toFixed(0)} ngày)`;

  const createCostRow = (stt: string, label: string, amount: number, baseAmount: number, note: string = '', isSubItem: boolean = false, isBold: boolean = false, isFooter: boolean = false) => {
      const percentage = baseAmount > 0 ? `${(amount / baseAmount * 100).toFixed(2)}%` : '0.00%';
      const paddingClass = isSubItem ? 'pl-8' : 'pl-4';
      const fontWeightClass = isBold || isFooter ? 'font-bold' : '';
      const backgroundClass = isFooter ? 'bg-gray-100' : 'bg-white';
      const textColorClass = isFooter ? 'text-gray-900' : 'text-gray-800';

      return `
          <tr class="border-b ${backgroundClass}">
              <td class="py-2 px-2 text-center text-sm ${fontWeightClass}">${stt}</td>
              <td class="py-2 ${paddingClass} pr-2 text-sm ${textColorClass} ${fontWeightClass}">${label}</td>
              <td class="py-2 px-4 text-right text-sm text-gray-900 ${fontWeightClass}">${formatCurrency(amount)}</td>
              <td class="py-2 px-4 text-right text-sm ${isBold || isFooter ? 'font-semibold text-gray-800' : 'text-gray-600'}">${percentage}</td>
              <td class="py-2 px-4 text-sm text-gray-600">${note}</td>
          </tr>
      `;
  };

  const costSummarySection = `
    <div class="mb-12 break-after-page">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">BẢNG TỔNG HỢP CHI PHÍ</h1>
        <p class="text-gray-600">Đơn vị tính: VND</p>
      </div>
      
      <div class="overflow-hidden border rounded-lg">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b">
              <th class="py-3 px-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-16">STT</th>
              <th class="py-3 pl-4 pr-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-2/5">Các loại chi phí</th>
              <th class="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Số tiền</th>
              <th class="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Tỷ lệ %/Doanh thu thuần</th>
              <th class="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ghi chú</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            ${createCostRow('1', 'Chi phí Thông quan & Vận hành (Được tính vào giá vốn)', totalClearanceAndLogistics, netRevenue, '', false, true)}
            ${createCostRow('1.1', 'Phí Hải quan', costTotals.customsFee, netRevenue, '', true)}
            ${createCostRow('1.2', 'Phí kiểm dịch', costTotals.quarantineFee, netRevenue, '', true)}
            ${createCostRow('1.3', 'Phí thuê Cont', costTotals.containerRentalFee, netRevenue, '', true)}
            ${createCostRow('1.4', 'Phí lưu kho bãi cảng', costTotals.portStorageFee, netRevenue, '', true)}
            ${createCostRow('1.5', 'Chi phí chung nhập kho', costTotals.generalWarehouseCost, netRevenue, '', true)}
            ${createCostRow('1.6', 'Lãi vay nhập hàng', costTotals.importInterestCost, netRevenue, '', true)}
            ${createCostRow('1.7', 'Phí lưu kho sau TQ', costTotals.postClearanceStorageCost, netRevenue, storageDaysNote, true)}
            ${createCostRow('1.8', 'DV mua hàng', costTotals.purchasingServiceFee, netRevenue, '', true)}
            ${createCostRow('1.9', 'Phí VC đến bên mua', costTotals.buyerDeliveryFee, netRevenue, '', true)}
            ${createCostRow('1.10', 'Chi phí khác', costTotals.otherInternationalPurchaseCost, netRevenue, '', true)}
            
            ${createCostRow('2', 'Chi phí Bán hàng', sellingCost, netRevenue, '', false, true)}
            ${createCostRow('2.1', 'Lương nhân viên bán hàng', costTotals.salesStaffSalary, netRevenue, '', true)}
            ${createCostRow('2.2', 'Chi phí khác', costTotals.otherSellingCosts, netRevenue, '', true)}

            ${createCostRow('3', 'Chi phí Quản lý doanh nghiệp', gaCost, netRevenue, '', false, true)}
            ${createCostRow('3.1', 'Lương nhân viên gián tiếp', costTotals.indirectStaffSalary, netRevenue, '', true)}
            ${createCostRow('3.2', 'Thuê nhà', costTotals.rent, netRevenue, '', true)}
            ${createCostRow('3.3', 'Điện', costTotals.electricity, netRevenue, '', true)}
            ${createCostRow('3.4', 'Nước', costTotals.water, netRevenue, '', true)}
            ${createCostRow('3.5', 'VPP', costTotals.stationery, netRevenue, '', true)}
            ${createCostRow('3.6', 'Khấu hao TSCĐ', costTotals.depreciation, netRevenue, '', true)}
            ${createCostRow('3.7', 'Dịch vụ mua ngoài', costTotals.externalServices, netRevenue, '', true)}
            ${createCostRow('3.8', 'Chi phí tiền khác', costTotals.otherCashExpenses, netRevenue, '', true)}

            ${createCostRow('4', 'Chi phí Tài chính', financialCost, netRevenue, '', false, true)}
            ${createCostRow('4.1', 'Chi phí tài sản, định giá...', costTotals.financialValuationCost, netRevenue, '', true)}
          </tbody>
          <tfoot class="bg-gray-100 font-bold">
             ${createCostRow('', 'Tổng Cộng', totalCost, netRevenue, '', false, false, true)}
          </tfoot>
        </table>
      </div>
       <div class="flex justify-between items-start mt-12">
            <p class="text-gray-600 text-sm italic">Ngày tạo báo cáo: ${generationDate}</p>
            <div class="text-center w-64">
                <p class="font-bold text-gray-800">Người lập báo cáo</p>
                <p class="italic text-sm text-gray-600 mb-12">(Ký, họ tên)</p>
            </div>
          </div>
    </div>
  `;
  // --- END: New Cost Summary Section ---

  const productSummaryTableHeaders = [
    "STT", "Sản phẩm", "Doanh thu", "Giá vốn hàng bán", "Lợi nhuận gộp", "CP Bán hàng", "CP Quản lý", "CP Tài chính",
    "Lợi nhuận trước thuế", "Thuế TNDN", "Lãi ròng", "Thuế GTGT Mua vào", "Thuế GTGT Bán ra", "Thuế GTGT Phải nộp", "Tổng thuế phải nộp", "Tỷ lệ Lãi ròng/Doanh thu"
  ];

  const productSummarySection = `
    <div class="mb-12 break-after-page">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">BÁO CÁO TỔNG HỢP THEO SẢN PHẨM</h1>
        <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        ${productSummaryTableHeaders.map(header => `<th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${items.map((item, index) => `
                        <tr>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">${index + 1}</td>
                            <td class="px-3 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">${item.code} - ${item.group} - ${item.nameVI}</div>
                                <div class="text-sm text-gray-500">${item.brand}</div>
                            </td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-green-700 text-right">${formatCurrency(item.calculated.totalRevenue)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${formatCurrency(item.calculated.totalCOGS)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-blue-700 font-medium text-right">${formatCurrency(item.calculated.grossProfit)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${formatCurrency(item.calculated.totalSellingCost)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${formatCurrency(item.calculated.totalGaCost)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${formatCurrency(item.calculated.totalFinancialCost)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-purple-700 font-medium text-right">${formatCurrency(item.calculated.profitBeforeTax)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-red-700 text-right">${formatCurrency(item.calculated.corporateIncomeTax)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm font-bold text-right ${item.calculated.netProfit && item.calculated.netProfit < 0 ? 'text-red-600' : 'text-green-600'}">${formatCurrency(item.calculated.netProfit)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${formatCurrency(item.calculated.importVAT)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${formatCurrency(item.calculated.outputVAT)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-right">${formatCurrency(item.calculated.vatPayable)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-red-700 font-bold text-right">${formatCurrency(item.calculated.totalTaxPayable)}</td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-right ${item.calculated.netProfitMargin && item.calculated.netProfitMargin < 0 ? 'text-red-600' : 'text-blue-700'}">${(item.calculated.netProfitMargin ?? 0).toFixed(2)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot class="bg-gray-100 font-bold">
                    <tr>
                        <td class="px-3 py-3 text-left text-sm text-gray-800 uppercase tracking-wider" colSpan="2">Tổng cộng</td>
                        <td class="px-3 py-3 text-right text-sm text-green-800">${formatCurrency(totals.totalRevenue)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.totalCOGS)}</td>
                        <td class="px-3 py-3 text-right text-sm text-blue-800">${formatCurrency(totals.grossProfit)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.totalSellingCost)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.totalGaCost)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.totalFinancialCost)}</td>
                        <td class="px-3 py-3 text-right text-sm text-purple-800">${formatCurrency(totals.profitBeforeTax)}</td>
                        <td class="px-3 py-3 text-right text-sm text-red-800">${formatCurrency(totals.corporateIncomeTax)}</td>
                        <td class="px-3 py-3 text-right text-sm ${totals.netProfit < 0 ? 'text-red-700' : 'text-green-700'}">${formatCurrency(totals.netProfit)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.importVAT)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.outputVAT)}</td>
                        <td class="px-3 py-3 text-right text-sm text-gray-700">${formatCurrency(totals.vatPayable)}</td>
                        <td class="px-3 py-3 text-right text-sm text-red-800">${formatCurrency(totals.totalTaxPayable)}</td>
                        <td class="px-3 py-3 text-right text-sm font-bold ${totalNetProfitMargin < 0 ? 'text-red-700' : 'text-blue-800'}">${totalNetProfitMargin.toFixed(2)}%</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  `;

  const detailSection = `
    <div>
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">BÁO CÁO KẾ HOẠCH KINH DOANH CHI TIẾT</h1>
      ${items.map(item => `
        <div class="mb-8 p-6 border rounded-lg break-inside-avoid bg-white shadow-sm">
           <h2 class="text-2xl font-semibold text-indigo-700 mb-1">${item.group} - ${item.nameVI} (${item.code})</h2>
           <p class="text-md text-gray-500 mb-2"><strong>Tên tiếng Anh:</strong> ${item.nameEN}</p>
           <p class="text-md text-gray-500 mb-6"><strong>Thương hiệu:</strong> ${item.brand}</p>
           
           <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div class="space-y-4">
                <h3 class="font-semibold text-lg pb-2 border-b text-gray-700">Chi phí nhập khẩu & Thuế</h3>
                ${createDetailRow('Số lượng (Kg)', formatCurrency(item.userInput.quantityInKg))}
                ${createDetailRow('Giá (USD)/Kg', (item.calculated.priceUSDPerKg || 0).toFixed(3))}
                ${createDetailRow('Tỷ giá USD/VNĐ', formatCurrency(importRate))}
                ${createDetailRow('Giá nhập (USD)', formatCurrency(item.calculated.importValueUSD))}
                ${createBoldDetailRow('Giá nhập (VNĐ)', formatCurrency(item.calculated.importValueVND))}
                ${createDetailRow('Thuế suất GTGT', '5%')}
                ${createDetailRow('Tỷ giá USD/VNĐ tính thuế', formatCurrency(taxRate))}
                ${createBoldDetailRow('Thuế GTGT nhập khẩu', formatCurrency(item.calculated.importVAT))}
             </div>
             
             <div class="space-y-4">
                <h3 class="font-semibold text-lg pb-2 border-b text-gray-700">Chi phí Thông quan & Vận hành</h3>
                ${createDetailRow('1.1 Phí Hải quan', formatCurrency(item.userInput.costs.customsFee), true)}
                ${createDetailRow('1.2 Phí kiểm dịch', formatCurrency(item.userInput.costs.quarantineFee), true)}
                ${createDetailRow('1.3 Phí thuê Cont', formatCurrency(item.userInput.costs.containerRentalFee), true)}
                ${createDetailRow('1.4 Phí lưu kho bãi cảng', formatCurrency(item.userInput.costs.portStorageFee), true)}
                ${createDetailRow('1.5 Chi phí chung nhập kho', formatCurrency(item.calculated.generalWarehouseCost), true)}
                ${createDetailRow('1.6 Lãi vay nhập hàng', formatCurrency(item.calculated.importInterestCost), true)}
                ${createDetailRow('1.7 Phí lưu kho sau TQ', formatCurrency(item.calculated.postClearanceStorageCost), true)}
                ${createDetailRow('1.8 DV mua hàng', formatCurrency(item.calculated.purchasingServiceFee), true)}
                ${createDetailRow('1.9 Phí VC đến bên mua', formatCurrency(item.userInput.costs.buyerDeliveryFee), true)}
                ${createDetailRow('1.10 Chi phí khác', formatCurrency(item.calculated.otherInternationalPurchaseCost), true)}
                ${createBoldDetailRow('Tổng Chi phí TQ & Kho', formatCurrency(item.calculated.totalClearanceAndLogisticsCost))}
             </div>
             
             <div class="space-y-4">
                <h3 class="font-semibold text-lg pb-2 border-b text-gray-700">Giá vốn & Doanh thu</h3>
                ${createDetailRow('Giá nhập (VNĐ)', formatCurrency(item.calculated.importValueVND))}
                ${createDetailRow('Tổng Chi phí TQ & Kho', formatCurrency(item.calculated.totalClearanceAndLogisticsCost))}
                ${createBoldDetailRow('Tổng giá vốn hàng bán', formatCurrency(item.calculated.totalCOGS))}
                ${createBoldDetailRow('Giá vốn/kg', formatCurrency(item.calculated.cogsPerKg))}
                 <div class="pt-4">
                    ${createDetailRow('Giá bán/kg (có VAT)', formatCurrency(item.userInput.sellingPriceVNDPerKg))}
                    ${createDetailRow('Giá bán/kg (ko VAT)', formatCurrency(item.calculated.sellingPriceExclVAT))}
                    ${createBoldDetailRow('Tổng doanh thu', formatCurrency(item.calculated.totalRevenue))}
                    ${createDetailRow('Thuế GTGT đầu ra (5%)', formatCurrency(item.calculated.outputVAT))}
                    ${createBoldDetailRow('Thuế GTGT phải nộp', formatCurrency(item.calculated.vatPayable))}
                 </div>
             </div>
           </div>
           
           <hr class="my-6 border-t-2 rounded"/>

           <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                  <h3 class="font-semibold text-lg pb-2 border-b text-gray-700">Chi phí Hoạt động</h3>
                  ${createDetailRow('CP Bán hàng', formatCurrency(item.calculated.totalSellingCost))}
                  ${createDetailRow('CP Quản lý DN', formatCurrency(item.calculated.totalGaCost))}
                  ${createDetailRow('CP Tài chính', formatCurrency(item.calculated.totalFinancialCost))}
                  ${createBoldDetailRow('Tổng chi phí hoạt động', formatCurrency((item.calculated.totalOperatingCost || 0) + (item.calculated.totalFinancialCost || 0)))}
              </div>
              <div>
                  <h3 class="font-semibold text-lg pb-2 border-b text-gray-700">Phân tích Lợi nhuận</h3>
                  ${createDetailRow('Doanh thu', formatCurrency(item.calculated.totalRevenue))}
                  ${createDetailRow('Giá vốn hàng bán', `-${formatCurrency(item.calculated.totalCOGS)}`)}
                  ${createBoldDetailRow('Lợi nhuận gộp', formatCurrency(item.calculated.grossProfit))}
                  ${createDetailRow('Tổng chi phí hoạt động', `-${formatCurrency((item.calculated.totalOperatingCost || 0) + (item.calculated.totalFinancialCost || 0))}`)}
                  ${createBoldDetailRow('Lợi nhuận trước thuế', formatCurrency(item.calculated.profitBeforeTax))}
                  ${createDetailRow('Thuế TNDN (20%)', `-${formatCurrency(item.calculated.corporateIncomeTax)}`)}
                  <div class="mt-2 p-2 rounded-lg bg-green-100">
                    ${createBoldDetailRow('Lãi ròng', formatCurrency(item.calculated.netProfit))}
                  </div>
              </div>
               <div>
                  <h3 class="font-semibold text-lg pb-2 border-b text-gray-700">Phân chia Lợi nhuận</h3>
                  ${createDetailRow('Trích lập dự phòng (10%)', formatCurrency(item.calculated.retainedForProvision))}
                  ${createDetailRow('Bổ sung vốn KD (60%)', formatCurrency(item.calculated.retainedForBusiness))}
                  ${createDetailRow('Chia cổ đông (30%)', formatCurrency(item.calculated.dividends))}
              </div>
           </div>
        </div>
      `).join('')}
    </div>
  `;

  const analysisSection = analysisHtml ? `
    <div class="break-inside-avoid">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8 mt-12">PHÂN TÍCH & ĐÁNH GIÁ KẾ HOẠCH (AI)</h1>
      <div class="analysis-content p-6 border rounded-lg bg-white shadow-sm text-gray-800">
        ${analysisHtml}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Báo cáo Kế hoạch Kinh doanh</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
            .break-after-page { page-break-after: always; }
            .break-inside-avoid { page-break-inside: avoid; }
          }
          .analysis-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; padding-bottom: 0.25em; border-bottom: 1px solid #e5e7eb; color: #1e3a8a; }
          .analysis-content p { margin-bottom: 1em; line-height: 1.6; }
          .analysis-content ul { list-style-position: inside; padding-left: 1em; margin-bottom: 1em; }
          .analysis-content li { margin-bottom: 0.5em; }
          .analysis-content strong { font-weight: 600; color: #1f2937; }
        </style>
    </head>
    <body class="bg-gray-100 font-sans">
      <div class="container mx-auto p-4 sm:p-8 bg-white shadow-lg my-8">
        ${summarySection}
        ${costSummarySection}
        ${productSummarySection}
        ${detailSection}
        ${analysisSection}
      </div>
    </body>
    </html>
  `;
};
