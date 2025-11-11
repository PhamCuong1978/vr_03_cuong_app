import React, { useState, useEffect } from 'react';
import type { PlanItem } from '../types';
import { InputGroup } from './InputGroup';
import { formatCurrency } from '../utils/formatters';
import { FormattedNumberInput } from './FormattedNumberInput';

interface PlanItemDetailsProps {
  item: PlanItem;
  updateItem: (id: string, field: string, value: number) => void;
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

export const PlanItemDetails: React.FC<PlanItemDetailsProps> = ({ 
    item, 
    updateItem, 
    planTotals, 
    salesSalaryRate, 
    setSalesSalaryRate,
    totalMonthlyIndirectSalary,
    setTotalMonthlyIndirectSalary,
    workingDaysPerMonth,
    setWorkingDaysPerMonth,
    totalMonthlyRent,
    setTotalMonthlyRent,
    totalMonthlyElectricity,
    setTotalMonthlyElectricity,
    totalMonthlyWater,
    setTotalMonthlyWater,
    totalMonthlyStationery,
    setTotalMonthlyStationery,
    totalMonthlyDepreciation,
    setTotalMonthlyDepreciation,
    totalMonthlyExternalServices,
    setTotalMonthlyExternalServices,
    totalMonthlyOtherCashExpenses,
    setTotalMonthlyOtherCashExpenses,
    totalMonthlyFinancialCost,
    setTotalMonthlyFinancialCost
}) => {
  const { id, userInput, calculated } = item;
  
  const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
  
  interface AllocatedCostBlockProps {
    id: string;
    label: string;
    totalMonthlyCost: number;
    setTotalMonthlyCost: (value: number) => void;
    allocatedCost?: number;
    totalQuantityInKg: number;
    itemQuantityInKg: number;
  }

  const AllocatedCostBlock: React.FC<AllocatedCostBlockProps> = ({ id, label, totalMonthlyCost, setTotalMonthlyCost, allocatedCost = 0, totalQuantityInKg, itemQuantityInKg }) => {
    const [localTotalCost, setLocalTotalCost] = useState(totalMonthlyCost);
    
    useEffect(() => {
        setLocalTotalCost(totalMonthlyCost);
    }, [totalMonthlyCost]);

    const handleCommit = (newValue: number) => {
        if (newValue !== totalMonthlyCost) {
            setTotalMonthlyCost(newValue);
        }
    }
    
    return (
        <div className="p-3 bg-white rounded border border-gray-200 space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex justify-between items-center text-sm">
                <label htmlFor={`total-cost-${id}`} className="text-gray-600">1. Tổng chi phí/tháng:</label>
                <div className="w-40">
                    <FormattedNumberInput
                        srOnlyLabel
                        label={`Tổng ${label}/tháng`}
                        id={`total-cost-${id}`}
                        value={localTotalCost}
                        onChange={setLocalTotalCost}
                        onCommit={handleCommit}
                        addon="VND"
                    />
                </div>
            </div>
            <DetailRow label="2. Tổng số lượng (kg)" value={formatCurrency(totalQuantityInKg)} />
            <DetailRow label="3. SL sản phẩm (kg)" value={formatCurrency(itemQuantityInKg)} />
            <div className="!mt-3 pt-2 border-t flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">4. Chi phí phân bổ</span>
                <span className="font-bold text-gray-900">{formatCurrency(allocatedCost)}</span>
            </div>
            <p className="text-xs text-gray-500 !mt-2 text-center italic">
                Công thức: Tổng chi phí tháng × (SL sản phẩm / Tổng SL)
            </p>
        </div>
    );
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        
        {/* Section 1: Quantity & Price */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 border-b pb-2">Số lượng &amp; Giá</h4>
          
          <FormattedNumberInput
            id={`quantity-${id}`}
            label="1. Số lượng (Kg)"
            value={userInput.quantityInKg}
            onChange={(value) => updateItem(id, 'quantityInKg', value)}
            addon={<span>~{calculated.containers?.toFixed(2)} cont</span>}
          />

          <FormattedNumberInput
            id={`priceUSD-${id}`}
            label="2. Giá mua (USD/tấn)"
            value={userInput.priceUSDPerTon}
            onChange={(value) => updateItem(id, 'priceUSDPerTon', value)}
            decimalPlaces={2}
          />
          <DetailRow label="= Giá mua (VND/tấn)" value={formatCurrency(calculated.priceVNDPerTon)} />
          
          <div className="!mt-3 pt-2 border-t flex justify-between items-center">
             <span className="text-sm font-semibold text-gray-700">3. Tổng giá mua (VND)</span>
             <span className="font-bold text-gray-900">{formatCurrency(calculated.importValueVND)}</span>
          </div>
          
          <FormattedNumberInput
            id={`importVatRate-${id}`}
            label="4. Thuế suất GTGT NK"
            value={userInput.costs.importVatRate}
            onChange={value => updateItem(id, 'costs.importVatRate', value)}
            decimalPlaces={2}
            addon="%"
          />

          <FormattedNumberInput
            id={`priceVND-${id}`}
            label="6. Giá bán (VND/kg)"
            value={userInput.sellingPriceVNDPerKg}
            onChange={(value) => updateItem(id, 'sellingPriceVNDPerKg', value)}
            addon="đã gồm VAT"
          />

          <div className="!mt-3 pt-2 border-t flex justify-between items-center">
             <span className="text-sm font-semibold text-gray-700">7. Tổng doanh thu (gồm VAT)</span>
             <span className="font-bold text-gray-900">{formatCurrency(calculated.totalRevenueInclVAT)}</span>
          </div>
        </div>


        {/* Section 2: Clearance & Logistics Costs */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 border-b pb-2">1. Chi phí thông quan & kho bãi</h4>
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Công thức tính (1.1+...+1.10)</span>
              <span className="font-bold text-gray-900 text-right">{formatCurrency(calculated.totalClearanceAndLogisticsCost)}</span>
            </div>
          </div>
           <FormattedNumberInput id={`customsFee-${id}`} label="1.1 Phí Hải quan" value={userInput.costs.customsFee} onChange={value => updateItem(id, 'costs.customsFee', value)} addon="VND" />
           <FormattedNumberInput id={`quarantineFee-${id}`} label="1.2 Phí kiểm dịch" value={userInput.costs.quarantineFee} onChange={value => updateItem(id, 'costs.quarantineFee', value)} addon="VND" />
           <FormattedNumberInput id={`containerRentalFee-${id}`} label="1.3 Phí thuê Cont" value={userInput.costs.containerRentalFee} onChange={value => updateItem(id, 'costs.containerRentalFee', value)} addon="VND" />
           <FormattedNumberInput id={`portStorageFee-${id}`} label="1.4 Phí lưu kho bãi cảng" value={userInput.costs.portStorageFee} onChange={value => updateItem(id, 'costs.portStorageFee', value)} addon="VND" />
           
           <div className="p-3 bg-white rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">1.5 Chi phí chung nhập kho</label>
              <div className="space-y-2">
                <FormattedNumberInput
                    srOnlyLabel 
                    label="Đơn giá chi phí chung" 
                    id={`generalWarehouseCostRate-${id}`} 
                    value={userInput.costs.generalWarehouseCostRatePerKg} 
                    onChange={value => updateItem(id, 'costs.generalWarehouseCostRatePerKg', value)} 
                    addon="VND/kg" 
                />
                <p className="text-sm text-gray-600">Số lượng (kg): <span className="font-semibold float-right text-gray-800">{formatCurrency(userInput.quantityInKg)}</span></p>
                <p className="text-sm text-gray-600">Cộng chi phí chung nhập kho: <span className="font-semibold float-right text-gray-800">{formatCurrency(calculated.generalWarehouseCost)}</span></p>
              </div>
           </div>

           <div className="p-3 bg-white rounded border border-gray-200 space-y-3">
              <label className="block text-sm font-medium text-gray-700">1.6 Chi phí lãi vay nhập hàng</label>
              
              <FormattedNumberInput label="1. Lãi suất" id={`loanInterestRate-${id}`} value={userInput.costs.loanInterestRatePerYear} onChange={value => updateItem(id, 'costs.loanInterestRatePerYear', value)} decimalPlaces={2} addon="%/năm" />

              <div className="border-t pt-3 space-y-2">
                <h5 className="font-medium text-sm text-gray-600">Lần chuyển 1</h5>
                <FormattedNumberInput label="2. Số tiền chuyển lần 1" id={`loanFirstTransferUSD-${id}`} value={userInput.costs.loanFirstTransferUSD} onChange={value => updateItem(id, 'costs.loanFirstTransferUSD', value)} addon="USD" decimalPlaces={2} />
                <DetailRow label="= Số tiền (VND)" value={formatCurrency(calculated.loanFirstTransferAmountVND)} />
                <FormattedNumberInput label="3. Thời gian tính lãi lần 1" id={`loanFirstTransferInterestDays-${id}`} value={userInput.costs.loanFirstTransferInterestDays} onChange={value => updateItem(id, 'costs.loanFirstTransferInterestDays', value)} addon="ngày" />
                <DetailRow label="4. Chi phí lãi vay lần 1" value={formatCurrency(calculated.loanInterestCostFirstTransfer)} />
              </div>

              <div className="border-t pt-3 space-y-2">
                <h5 className="font-medium text-sm text-gray-600">Lần chuyển 2</h5>
                <DetailRow label="5. Số tiền chuyển lần 2" value={formatCurrency(calculated.loanSecondTransferAmountVND)} />
                <p className="text-sm text-gray-600">Thời gian tính lãi: <span className="font-semibold float-right text-gray-800">{userInput.costs.postClearanceStorageDays} ngày</span></p>
                <DetailRow label="6. Chi phí lãi vay lần 2" value={formatCurrency(calculated.loanInterestCostSecondTransfer)} />
              </div>

              <div className="!mt-3 pt-2 border-t flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">7. Tổng lãi vay</span>
                <span className="font-bold text-gray-900">{formatCurrency(calculated.importInterestCost)}</span>
              </div>
            </div>
           
           <div className="p-3 bg-white rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">1.7 Phí lưu kho sau thông quan</label>
              <div className="grid grid-cols-2 gap-2">
                  <FormattedNumberInput srOnlyLabel label="Số ngày lưu kho" id={`postClearanceStorageDays-${id}`} value={userInput.costs.postClearanceStorageDays} onChange={value => updateItem(id, 'costs.postClearanceStorageDays', value)} addon="ngày" />
                  <FormattedNumberInput srOnlyLabel label="Đơn giá lưu kho" id={`postClearanceStorageRate-${id}`} value={userInput.costs.postClearanceStorageRatePerKgDay} onChange={value => updateItem(id, 'costs.postClearanceStorageRatePerKgDay', value)} addon="VND/kg" />
              </div>
              <p className="text-sm mt-2 text-gray-600">Chi phí lưu kho: <span className="font-semibold float-right text-gray-800">{formatCurrency(calculated.postClearanceStorageCost)}</span></p>
           </div>
           
           <div className="p-3 bg-white rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">1.8 Chi phí thuê dịch vụ mua hàng</label>
              <div className="space-y-2">
                <FormattedNumberInput
                    srOnlyLabel 
                    label="Đơn giá thuê dịch vụ mua hàng" 
                    id={`purchasingServiceFee-${id}`} 
                    value={userInput.costs.purchasingServiceFeeInMillionsPerCont * 1000000} 
                    onChange={value => updateItem(id, 'costs.purchasingServiceFeeInMillionsPerCont', value / 1000000)} 
                    addon="VND/cont" 
                />
                <p className="text-sm text-gray-600">Số lượng (cont): <span className="font-semibold float-right text-gray-800">{calculated.containers?.toFixed(2)}</span></p>
                <div className="!mt-3 pt-2 border-t flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Tổng chi phí thuê</span>
                  <span className="font-bold text-gray-900">{formatCurrency(calculated.purchasingServiceFee)}</span>
                </div>
              </div>
            </div>
           
           <FormattedNumberInput id={`buyerDeliveryFee-${id}`} label="1.9 Phí VC đến kho bên mua" value={userInput.costs.buyerDeliveryFee} onChange={value => updateItem(id, 'costs.buyerDeliveryFee', value)} addon="VND" />
           <FormattedNumberInput id={`otherInternationalCosts-${id}`} label="1.10 Chi phí khác" value={userInput.costs.otherInternationalCosts} onChange={value => updateItem(id, 'costs.otherInternationalCosts', value)} addon="VND"/>
        </div>

        {/* Section 3: All Operating Costs */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg md:col-span-2 lg:col-span-1">
          <h4 className="font-semibold text-gray-700 border-b pb-2">2. Chi phí bán hàng</h4>
           <div className="p-2 bg-white rounded border border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Công thức tính (2.1+2.2)</span>
              <span className="font-bold text-gray-900 text-right">{formatCurrency(calculated.totalSellingCost)}</span>
            </div>
          </div>
          <div className="p-3 bg-white rounded border border-gray-200 space-y-2">
            <label className="block text-sm font-medium text-gray-700">2.1 Lương nhân viên bán hàng</label>
            <DetailRow label="1. Tổng LN gộp" value={formatCurrency(planTotals.totalGrossProfit)} />
            
            <div className="flex justify-between items-center text-sm">
              <label htmlFor={`sales-salary-rate-${id}`} className="text-gray-600">2. Tỷ lệ lương:</label>
              <div className="w-28">
                 <FormattedNumberInput
                    srOnlyLabel
                    label="Tỷ lệ lương NV bán hàng"
                    id={`sales-salary-rate-${id}`}
                    value={salesSalaryRate}
                    onChange={setSalesSalaryRate}
                    decimalPlaces={2}
                    addon="%"
                  />
              </div>
            </div>

            <DetailRow label="3. Tổng số lượng (kg)" value={formatCurrency(planTotals.totalQuantityInKg)} />
            <DetailRow label="4. SL sản phẩm (kg)" value={formatCurrency(userInput.quantityInKg)} />
            <div className="!mt-3 pt-2 border-t flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">5. Số tiền lương</span>
              <span className="font-bold text-gray-900">{formatCurrency(calculated.salesStaffSalary)}</span>
            </div>
            <p className="text-xs text-gray-500 !mt-2 text-center italic">
              Công thức: (Tổng LN gộp × Tỷ lệ lương) / Tổng SL × SL sản phẩm
            </p>
          </div>
          <FormattedNumberInput id={`otherSellingCosts-${id}`} label="2.2 Chi phí khác tại nơi bán" value={userInput.costs.otherSellingCosts} onChange={value => updateItem(id, 'costs.otherSellingCosts', value)} addon="VND" />

          <h4 className="font-semibold text-gray-700 border-b pt-4 pb-2">3. Chi phí quản lý doanh nghiệp</h4>
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Công thức tính (3.1+...+3.8)</span>
              <span className="font-bold text-gray-900 text-right">{formatCurrency(calculated.totalGaCost)}</span>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded border border-gray-200 space-y-2">
            <label className="block text-sm font-medium text-gray-700">3.1 Lương nhân viên gián tiếp</label>
            
            <div className="flex justify-between items-center text-sm">
                <label htmlFor={`total-indirect-salary-${id}`} className="text-gray-600">1. Tổng lương/tháng:</label>
                <div className="w-40">
                    <FormattedNumberInput
                        srOnlyLabel
                        label="Tổng lương gián tiếp/tháng"
                        id={`total-indirect-salary-${id}`}
                        value={totalMonthlyIndirectSalary}
                        onChange={setTotalMonthlyIndirectSalary}
                        addon="VND"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center text-sm">
                <label htmlFor={`working-days-${id}`} className="text-gray-600">2. Số ngày công/tháng:</label>
                <div className="w-40">
                    <FormattedNumberInput
                        srOnlyLabel
                        label="Số ngày công/tháng"
                        id={`working-days-${id}`}
                        value={workingDaysPerMonth}
                        onChange={setWorkingDaysPerMonth}
                        addon="ngày"
                    />
                </div>
            </div>
            
            <DetailRow label="3. Lương 1 ngày (tham khảo)" value={formatCurrency(workingDaysPerMonth > 0 ? totalMonthlyIndirectSalary / workingDaysPerMonth : 0)} />
            <DetailRow label="4. Tổng số lượng (kg)" value={formatCurrency(planTotals.totalQuantityInKg)} />
            <DetailRow label="5. SL sản phẩm (kg)" value={formatCurrency(userInput.quantityInKg)} />

            <div className="!mt-3 pt-2 border-t flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">6. Lương phân bổ</span>
              <span className="font-bold text-gray-900">{formatCurrency(calculated.indirectStaffSalary)}</span>
            </div>
             <p className="text-xs text-gray-500 !mt-2 text-center italic">
              Công thức: Tổng lương tháng × (SL sản phẩm / Tổng SL)
            </p>
          </div>
          
          <div className="space-y-3">
             <AllocatedCostBlock id={`rent-${id}`} label="3.2 Thuê nhà" totalMonthlyCost={totalMonthlyRent} setTotalMonthlyCost={setTotalMonthlyRent} allocatedCost={calculated.rent} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
             <AllocatedCostBlock id={`electricity-${id}`} label="3.3 Điện" totalMonthlyCost={totalMonthlyElectricity} setTotalMonthlyCost={setTotalMonthlyElectricity} allocatedCost={calculated.electricity} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
             <AllocatedCostBlock id={`water-${id}`} label="3.4 Nước" totalMonthlyCost={totalMonthlyWater} setTotalMonthlyCost={setTotalMonthlyWater} allocatedCost={calculated.water} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
             <AllocatedCostBlock id={`stationery-${id}`} label="3.5 VPP" totalMonthlyCost={totalMonthlyStationery} setTotalMonthlyCost={setTotalMonthlyStationery} allocatedCost={calculated.stationery} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
             <AllocatedCostBlock id={`depreciation-${id}`} label="3.6 Khấu hao TSCĐ" totalMonthlyCost={totalMonthlyDepreciation} setTotalMonthlyCost={setTotalMonthlyDepreciation} allocatedCost={calculated.depreciation} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
             <AllocatedCostBlock id={`externalServices-${id}`} label="3.7 Dịch vụ mua ngoài" totalMonthlyCost={totalMonthlyExternalServices} setTotalMonthlyCost={setTotalMonthlyExternalServices} allocatedCost={calculated.externalServices} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
             <AllocatedCostBlock id={`otherCashExpenses-${id}`} label="3.8 Chi phí tiền khác" totalMonthlyCost={totalMonthlyOtherCashExpenses} setTotalMonthlyCost={setTotalMonthlyOtherCashExpenses} allocatedCost={calculated.otherCashExpenses} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
          </div>

          <h4 className="font-semibold text-gray-700 border-b pt-4 pb-2">4. Chi phí Tài chính</h4>
          <AllocatedCostBlock id={`financialCost-${id}`} label="4.1 CP tài sản, định giá..." totalMonthlyCost={totalMonthlyFinancialCost} setTotalMonthlyCost={setTotalMonthlyFinancialCost} allocatedCost={calculated.financialValuationCost} totalQuantityInKg={planTotals.totalQuantityInKg} itemQuantityInKg={userInput.quantityInKg} />
        </div>
        
      </div>
    </div>
  );
};