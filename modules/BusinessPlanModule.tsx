import React, { useState, useEffect } from 'react';
import { SettingsPanel } from '../components/SettingsPanel';
import { ProductSelection } from '../components/ProductSelection';
import { PlanTable } from '../components/PlanTable';
import { PRODUCTS } from '../data/products';
import type { PlanItem, Product, AddProductDetails, SavedPlanSettings, SavedPlan } from '../types';
import { recalculateEntirePlan } from '../utils/calculators';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { ReportGenerator } from '../components/ReportGenerator';
import { DatabaseIcon } from '../components/icons/DatabaseIcon';
import { DocumentDownloadIcon } from '../components/icons/DocumentDownloadIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import { AiAssistantModal } from '../components/AiAssistantModal';
import { AddProductModal } from '../components/AddProductModal';
import { ManageProductsModal } from '../components/ManageProductsModal';
import { PencilIcon } from '../components/icons/PencilIcon';
import { EditProductModal } from '../components/EditProductModal';

interface BusinessPlanModuleProps {
  planToLoad: SavedPlan | null;
  onPlanLoaded: () => void;
}

const BusinessPlanModule: React.FC<BusinessPlanModuleProps> = ({ planToLoad, onPlanLoaded }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem('businessPlanProducts');
      if (savedProducts) {
        return JSON.parse(savedProducts);
      }
    } catch (error) {
      console.error("Could not load products from localStorage", error);
    }
    return PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('businessPlanProducts', JSON.stringify(products));
    } catch (error) {
      console.error("Could not save products to localStorage", error);
    }
  }, [products]);

  const [uncalculatedPlanItems, setUncalculatedPlanItems] = useState<PlanItem[]>([]);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  
  // Group all settings into a single state object
  const [settings, setSettings] = useState<SavedPlanSettings>({
    exchangeRateImport: 26356,
    exchangeRateTax: 26154,
    salesSalaryRate: 20,
    totalMonthlyIndirectSalary: 75000000,
    workingDaysPerMonth: 24,
    totalMonthlyRent: 6000000,
    totalMonthlyElectricity: 2000000,
    totalMonthlyWater: 500000,
    totalMonthlyStationery: 500000,
    totalMonthlyDepreciation: 0,
    totalMonthlyExternalServices: 1000000,
    totalMonthlyOtherCashExpenses: 1000000,
    totalMonthlyFinancialCost: 0,
  });

  // Helper function to update a specific setting
  const updateSetting = (key: keyof SavedPlanSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const [selectedProductCode, setSelectedProductCode] = useState<string>(products.length > 0 ? products[0].code : '');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isManageProductsModalOpen, setIsManageProductsModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => {
    if (planToLoad) {
      // Create new plan item objects to avoid reference issues
      const newPlanItems = planToLoad.planItems.map(item => ({...item}));
      setUncalculatedPlanItems(newPlanItems);
      setSettings(planToLoad.settings);
      onPlanLoaded(); // Clear the plan from App state
    }
  }, [planToLoad, onPlanLoaded]);


  const handleExportCatalog = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'products.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCatalog = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Không thể đọc file.');
        }
        const importedProducts = JSON.parse(text);

        if (Array.isArray(importedProducts) && (importedProducts.length === 0 || (
            'code' in importedProducts[0] && 
            'nameVI' in importedProducts[0] &&
            'brand' in importedProducts[0] &&
            'defaultWeightKg' in importedProducts[0]
            ))) {
          setProducts(importedProducts);
          alert(`Tải lên thành công ${importedProducts.length} sản phẩm!`);
        } else {
          throw new Error('Định dạng file không hợp lệ. Vui lòng kiểm tra lại file JSON.');
        }
      } catch (error) {
        alert(`Lỗi khi xử lý file: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleImportPlan = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') throw new Error('Không thể đọc file.');
              
              const importedPlan = JSON.parse(text) as SavedPlan;

              // Validate the imported plan structure
              if (importedPlan && Array.isArray(importedPlan.planItems) && importedPlan.settings && typeof importedPlan.settings.exchangeRateImport === 'number') {
                  // Create new objects to avoid reference issues
                  const newPlanItems = importedPlan.planItems.map((item: any) => ({...item}));
                  setUncalculatedPlanItems(newPlanItems);
                  setSettings(importedPlan.settings);
                  alert(`Tải lên thành công kế hoạch "${importedPlan.name || 'không tên'}"!`);
              } else {
                  throw new Error('Định dạng file kế hoạch không hợp lệ. Vui lòng kiểm tra lại file JSON được xuất từ ứng dụng.');
              }
          } catch (error) {
              alert(`Lỗi khi xử lý file: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
          } finally {
              if(event.target) event.target.value = ''; // Reset input
          }
      };
      reader.readAsText(file);
  };

  const addNewProduct = (newProduct: Product) => {
    if (products.some(p => p.code.toLowerCase() === newProduct.code.toLowerCase())) {
      alert(`Lỗi: Mã sản phẩm "${newProduct.code}" đã tồn tại.`);
      return;
    }
    const updatedProducts = [...products, newProduct].sort((a, b) => a.brand.localeCompare(b.brand) || a.nameVI.localeCompare(b.nameVI));
    setProducts(updatedProducts);
    setSelectedProductCode(newProduct.code);
    setIsAddProductModalOpen(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.code === updatedProduct.code ? updatedProduct : p))
    );
    setIsEditProductModalOpen(false);
    setProductToEdit(null);
    setIsManageProductsModalOpen(true); // Re-open the manage modal for a seamless workflow
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsManageProductsModalOpen(false);
    setIsEditProductModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditProductModalOpen(false);
    setProductToEdit(null);
    setIsManageProductsModalOpen(true); // Re-open manage modal on cancel
  };
  
  const handleAddNewProductFromManage = () => {
    setIsManageProductsModalOpen(false);
    setIsAddProductModalOpen(true);
  };


  useEffect(() => {
    const calculatedItems = recalculateEntirePlan(uncalculatedPlanItems, {
      importRate: settings.exchangeRateImport,
      taxRate: settings.exchangeRateTax,
      salesSalaryRate: settings.salesSalaryRate,
      ...settings
    });
    setPlanItems(calculatedItems);
  }, [uncalculatedPlanItems, settings]);

  const addProductToPlan = (details: AddProductDetails) => {
    const productToAdd = products.find(p => p.code === details.productCode);
    if (productToAdd) {
      const uniqueId = `${productToAdd.code}-${new Date().getTime()}`;
      if (!planItems.some(item => item.id === uniqueId)) {
        const newItem: PlanItem = {
          id: uniqueId,
          ...productToAdd,
          userInput: {
            priceUSDPerTon: details.priceUSDPerTon,
            sellingPriceVNDPerKg: details.sellingPriceVNDPerKg,
            quantityInKg: details.quantityInKg,
            costs: {
              customsFee: 0,
              quarantineFee: 0,
              containerRentalFee: 0,
              portStorageFee: 0,
              generalWarehouseCostRatePerKg: 1300,
              loanInterestRatePerYear: 8,
              loanFirstTransferUSD: 10000,
              loanFirstTransferInterestDays: 30,
              postClearanceStorageDays: 20,
              postClearanceStorageRatePerKgDay: 150,
              importVatRate: 5,
              purchasingServiceFeeInMillionsPerCont: 5,
              buyerDeliveryFee: 0,
              otherInternationalCosts: 0,
              otherSellingCosts: 0,
            }
          },
          calculated: {},
        };
        
        setUncalculatedPlanItems(prevItems => [...prevItems, newItem]);
      }
    }
  };

  const updatePlanItem = (id: string, field: string, value: number) => {
    setUncalculatedPlanItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = JSON.parse(JSON.stringify(item));
          if (field.startsWith('costs.')) {
            const costField = field.split('.')[1] as keyof PlanItem['userInput']['costs'];
            updatedItem.userInput.costs[costField] = value;
          } else {
            const topLevelField = field as keyof Omit<PlanItem['userInput'], 'costs'>;
            updatedItem.userInput[topLevelField] = value;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  const removePlanItem = (id: string) => {
    setUncalculatedPlanItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const planTotals = planItems.reduce(
    (acc, item) => {
      acc.totalGrossProfit += item.calculated.grossProfit || 0;
      acc.totalQuantityInKg += item.userInput.quantityInKg || 0;
      return acc;
    },
    { totalGrossProfit: 0, totalQuantityInKg: 0 }
  );

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 mb-6">
          <SettingsPanel
            exchangeRateImport={settings.exchangeRateImport}
            setExchangeRateImport={(v) => updateSetting('exchangeRateImport', v)}
            exchangeRateTax={settings.exchangeRateTax}
            setExchangeRateTax={(v) => updateSetting('exchangeRateTax', v)}
            salesSalaryRate={settings.salesSalaryRate}
            setSalesSalaryRate={(v) => updateSetting('salesSalaryRate', v)}
          />
          <ProductSelection
            products={products}
            selectedProductCode={selectedProductCode}
            setSelectedProductCode={setSelectedProductCode}
            addProductToPlan={addProductToPlan}
            onAddNewProduct={() => setIsAddProductModalOpen(true)}
            onImportPlan={handleImportPlan}
          />
        </div>

        {planItems.length > 0 ? (
          <PlanTable 
            items={planItems} 
            updateItem={updatePlanItem} 
            removeItem={removePlanItem} 
            planTotals={planTotals}
            salesSalaryRate={settings.salesSalaryRate}
            setSalesSalaryRate={(v) => updateSetting('salesSalaryRate', v)}
            totalMonthlyIndirectSalary={settings.totalMonthlyIndirectSalary}
            setTotalMonthlyIndirectSalary={(v) => updateSetting('totalMonthlyIndirectSalary', v)}
            workingDaysPerMonth={settings.workingDaysPerMonth}
            setWorkingDaysPerMonth={(v) => updateSetting('workingDaysPerMonth', v)}
            totalMonthlyRent={settings.totalMonthlyRent}
            setTotalMonthlyRent={(v) => updateSetting('totalMonthlyRent', v)}
            totalMonthlyElectricity={settings.totalMonthlyElectricity}
            setTotalMonthlyElectricity={(v) => updateSetting('totalMonthlyElectricity', v)}
            totalMonthlyWater={settings.totalMonthlyWater}
            setTotalMonthlyWater={(v) => updateSetting('totalMonthlyWater', v)}
            totalMonthlyStationery={settings.totalMonthlyStationery}
            setTotalMonthlyStationery={(v) => updateSetting('totalMonthlyStationery', v)}
            totalMonthlyDepreciation={settings.totalMonthlyDepreciation}
            setTotalMonthlyDepreciation={(v) => updateSetting('totalMonthlyDepreciation', v)}
            totalMonthlyExternalServices={settings.totalMonthlyExternalServices}
            setTotalMonthlyExternalServices={(v) => updateSetting('totalMonthlyExternalServices', v)}
            totalMonthlyOtherCashExpenses={settings.totalMonthlyOtherCashExpenses}
            setTotalMonthlyOtherCashExpenses={(v) => updateSetting('totalMonthlyOtherCashExpenses', v)}
            totalMonthlyFinancialCost={settings.totalMonthlyFinancialCost}
            setTotalMonthlyFinancialCost={(v) => updateSetting('totalMonthlyFinancialCost', v)}
          />
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
            <PlusCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có sản phẩm nào trong kế hoạch</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách chọn một sản phẩm và thêm vào kế hoạch kinh doanh của bạn.</p>
          </div>
        )}

        <div className="mt-6">
          <ReportGenerator
            items={planItems}
            uncalculatedItems={uncalculatedPlanItems}
            settings={settings}
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
          />
        </div>

        <div className="mt-6">
            <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <DatabaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                Quản lý dữ liệu sản phẩm
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Chỉnh sửa, tải xuống danh sách sản phẩm hiện tại hoặc tải lên danh sách mới từ file JSON để cập nhật.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setIsManageProductsModalOpen(true)}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Chỉnh sửa danh mục
                </button>
                <button 
                  onClick={handleExportCatalog}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                  Xuất file JSON
                </button>
                
                <label 
                  htmlFor="import-json" 
                  className="w-full cursor-pointer flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UploadIcon className="h-5 w-5 mr-2" />
                  Nhập Danh mục (JSON)
                </label>
                <input
                  id="import-json"
                  type="file"
                  className="hidden"
                  accept=".json,application/json"
                  onChange={handleImportCatalog}
                />
              </div>
            </div>
        </div>
      </div>
      <ManageProductsModal
        isOpen={isManageProductsModalOpen}
        onClose={() => setIsManageProductsModalOpen(false)}
        products={products}
        setProducts={setProducts}
        onEditProduct={handleOpenEditModal}
        onAddNewProduct={handleAddNewProductFromManage}
      />
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        products={products}
        planItems={planItems}
        updatePlanItem={updatePlanItem}
        removePlanItem={removePlanItem}
        addProductToPlan={addProductToPlan}
        setters={{
          setExchangeRateImport: (v) => updateSetting('exchangeRateImport', v),
          setExchangeRateTax: (v) => updateSetting('exchangeRateTax', v),
          setSalesSalaryRate: (v) => updateSetting('salesSalaryRate', v),
          setTotalMonthlyIndirectSalary: (v) => updateSetting('totalMonthlyIndirectSalary', v),
          setWorkingDaysPerMonth: (v) => updateSetting('workingDaysPerMonth', v),
          setTotalMonthlyRent: (v) => updateSetting('totalMonthlyRent', v),
          setTotalMonthlyElectricity: (v) => updateSetting('totalMonthlyElectricity', v),
          setTotalMonthlyWater: (v) => updateSetting('totalMonthlyWater', v),
          setTotalMonthlyStationery: (v) => updateSetting('totalMonthlyStationery', v),
          setTotalMonthlyDepreciation: (v) => updateSetting('totalMonthlyDepreciation', v),
          setTotalMonthlyExternalServices: (v) => updateSetting('totalMonthlyExternalServices', v),
          setTotalMonthlyOtherCashExpenses: (v) => updateSetting('totalMonthlyOtherCashExpenses', v),
          setTotalMonthlyFinancialCost: (v) => updateSetting('totalMonthlyFinancialCost', v),
        }}
      />
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={addNewProduct}
      />
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateProduct}
        product={productToEdit}
      />
    </>
  );
};

export default BusinessPlanModule;