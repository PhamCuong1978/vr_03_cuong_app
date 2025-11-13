
export interface Product {
  code: string;
  nameEN: string;
  nameVI: string;
  brand: string;
  group: string; // Added to categorize products e.g., 'Thịt trâu', 'Thịt lợn'
  defaultWeightKg: number; // Represents the weight of a standard container for this product
  defaultPriceUSDPerTon: number;
  defaultSellingPriceVND: number;
}

export interface PlanItem extends Product {
  id: string;
  userInput: {
    // Pricing
    priceUSDPerTon: number;
    sellingPriceVNDPerKg: number;
    // Quantity
    quantityInKg: number;
    
    // Cost inputs (per product line)
    costs: {
      // Category 1: Clearance & Logistics
      customsFee: number;
      quarantineFee: number;
      containerRentalFee: number;
      portStorageFee: number;
      generalWarehouseCostRatePerKg: number; // New for 1.5
      loanInterestRatePerYear: number; // New for 1.6
      loanFirstTransferUSD: number; // New for 1.6
      loanFirstTransferInterestDays: number; // New for 1.6
      postClearanceStorageDays: number;
      postClearanceStorageRatePerKgDay: number; // New for 1.7
      importVatRate: number; // User-configurable VAT rate
      purchasingServiceFeeInMillionsPerCont: number; // New for 1.8
      buyerDeliveryFee: number;
      otherInternationalCosts: number; // Replaces otherInternationalCostsInMillions for 1.10

      // Category 2: Selling
      otherSellingCosts: number;

      // Category 3 & 4 are now calculated based on monthly totals
    }
  };
  calculated: {
    // Base
    importValueUSD?: number;
    priceUSDPerKg?: number;
    priceVNDPerTon?: number; // New for display
    importValueVND?: number;
    importVAT?: number;
    containers?: number;
    outputVAT?: number;
    vatPayable?: number;
    sellingPriceExclVAT?: number;
    totalRevenueInclVAT?: number; // New for display

    // Costs Category 1: Clearance & Logistics
    generalWarehouseCost?: number; // New for 1.5
    importInterestCost?: number; // 1.6
    loanFirstTransferAmountVND?: number; // New for 1.6
    loanInterestCostFirstTransfer?: number; // New for 1.6
    loanSecondTransferAmountVND?: number; // New for 1.6
    loanInterestCostSecondTransfer?: number; // New for 1.6
    postClearanceStorageCost?: number; // 1.7
    purchasingServiceFee?: number; // Replaces postClearanceFinancialCost for 1.8
    otherInternationalPurchaseCost?: number; // 1.10
    totalClearanceAndLogisticsCost?: number;

    // Costs Category 2: Selling
    salesStaffSalary?: number;
    totalSellingCost?: number;

    // Costs Category 3: G&A
    indirectStaffSalary?: number;
    rent?: number;
    electricity?: number;
    water?: number;
    stationery?: number;
    depreciation?: number;
    externalServices?: number;
    otherCashExpenses?: number;
    totalGaCost?: number;
    
    // Costs Category 4: Financial
    financialValuationCost?: number;
    totalFinancialCost?: number;

    // Summaries
    totalCOGS?: number;
    cogsPerKg?: number;
    totalRevenue?: number;
    grossProfit?: number;
    totalOperatingCost?: number; // Selling + G&A
    totalPreTaxCost?: number; // All costs before tax
    profitBeforeTax?: number;
    corporateIncomeTax?: number;
    netProfit?: number;
    totalTaxPayable?: number;
    
    // Profit Distribution
    retainedForProvision?: number;
    retainedForBusiness?: number;
    dividends?: number;
  };
}

export interface AddProductDetails {
  productCode: string;
  quantityInKg: number;
  priceUSDPerTon: number;
  sellingPriceVNDPerKg: number;
}

export interface MeetingDetails {
    timeAndPlace: string;
    attendees: string;
    chair: string;
    topic: string;
}

export interface SavedPlanSettings {
  exchangeRateImport: number;
  exchangeRateTax: number;
  salesSalaryRate: number;
  totalMonthlyIndirectSalary: number;
  workingDaysPerMonth: number;
  totalMonthlyRent: number;
  totalMonthlyElectricity: number;
  totalMonthlyWater: number;
  totalMonthlyStationery: number;
  totalMonthlyDepreciation: number;
  totalMonthlyExternalServices: number;
  totalMonthlyOtherCashExpenses: number;
  totalMonthlyFinancialCost: number;
}

export interface SavedPlan {
  id: string; // timestamp based
  name: string;
  createdAt: string; // ISO date string
  planItems: PlanItem[]; // The raw items with user input
  settings: SavedPlanSettings;
}
