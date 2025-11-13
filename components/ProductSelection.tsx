import React, { useState, useEffect, useMemo } from 'react';
import type { Product, AddProductDetails } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { CubeIcon } from './icons/CubeIcon';
import { InputGroup } from './InputGroup';
import { FormattedNumberInput } from './FormattedNumberInput';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { UploadIcon } from './icons/UploadIcon';

interface ProductSelectionProps {
  products: Product[];
  selectedProductCode: string;
  setSelectedProductCode: (code: string) => void;
  addProductToPlan: (details: AddProductDetails) => void;
  onAddNewProduct: () => void;
  onImportPlan: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({
  products,
  selectedProductCode,
  setSelectedProductCode,
  addProductToPlan,
  onAddNewProduct,
  onImportPlan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const searchTerm = searchQuery.toLowerCase();
    return products.filter(product =>
        product.code.toLowerCase().includes(searchTerm) ||
        product.nameVI.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.group.toLowerCase().includes(searchTerm)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    const currentSelectionExists = filteredProducts.some(p => p.code === selectedProductCode);
    if (!currentSelectionExists && filteredProducts.length > 0) {
      setSelectedProductCode(filteredProducts[0].code);
    }
  }, [filteredProducts, selectedProductCode, setSelectedProductCode]);

  const selectedProduct = products.find(p => p.code === selectedProductCode);

  const [quantityInKg, setQuantityInKg] = useState(0);
  const [quantityInCont, setQuantityInCont] = useState('');
  const [priceUSD, setPriceUSD] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  useEffect(() => {
    if (selectedProduct) {
      const defaultKg = selectedProduct.defaultWeightKg;
      setQuantityInKg(defaultKg);
      setQuantityInCont('1');
      setPriceUSD(selectedProduct.defaultPriceUSDPerTon);
      setSellingPrice(selectedProduct.defaultSellingPriceVND);
    }
  }, [selectedProduct]);

  const handleKgChange = (kg: number) => {
    setQuantityInKg(kg);
    if (selectedProduct && selectedProduct.defaultWeightKg > 0 && !isNaN(kg)) {
      setQuantityInCont((kg / selectedProduct.defaultWeightKg).toFixed(2));
    }
  };

  const handleContChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const contValue = e.target.value;
    setQuantityInCont(contValue);
    const cont = Number(contValue);
    if (selectedProduct && !isNaN(cont)) {
      setQuantityInKg(Math.round(cont * selectedProduct.defaultWeightKg));
    }
  };

  const handleAddClick = () => {
    addProductToPlan({
      productCode: selectedProductCode,
      quantityInKg: Number(quantityInKg) || 0,
      priceUSDPerTon: Number(priceUSD) || 0,
      sellingPriceVNDPerKg: Number(sellingPrice) || 0,
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CubeIcon className="h-5 w-5 mr-2 text-gray-500" />
          Thêm sản phẩm vào kế hoạch
        </h3>
        <div>
            <label 
                htmlFor="import-plan-selection"
                className="cursor-pointer flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                <UploadIcon className="h-5 w-5 mr-2" />
                Tải lên Kế hoạch
            </label>
            <input
                id="import-plan-selection"
                type="file"
                className="hidden"
                accept=".json,application/json"
                onChange={onImportPlan}
            />
        </div>
      </div>

      <div className="space-y-4">
        <InputGroup
          id="product-search"
          label="Tìm kiếm sản phẩm (theo mã, tên, thương hiệu, nhóm)"
          type="text"
          placeholder="Ví dụ: gõ 'thịt trâu' hoặc 'thăn'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">
              Chọn sản phẩm
            </label>
            <button
              onClick={onAddNewProduct}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
            >
              <PlusCircleIcon className="h-4 w-4" />
              <span>Thêm mới</span>
            </button>
          </div>
          <select
            id="product-select"
            value={selectedProductCode}
            onChange={(e) => setSelectedProductCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {filteredProducts.map((product) => (
              <option key={product.code} value={product.code}>
                {`${product.brand} - ${product.group} - ${product.nameVI} (${product.code})`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormattedNumberInput id="quantity-kg" label="Số lượng (KG)" value={quantityInKg} onChange={handleKgChange} enableVoice />
          <InputGroup id="quantity-cont" label="Số lượng (Cont)" type="number" value={quantityInCont} onChange={handleContChange} step="0.01"/>
          <FormattedNumberInput id="price-usd" label="Giá nhập (USD/Tấn)" value={priceUSD} onChange={setPriceUSD} decimalPlaces={2} enableVoice />
          <FormattedNumberInput id="selling-price-vnd" label="Giá bán (VND/KG)" value={sellingPrice} onChange={setSellingPrice} enableVoice />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleAddClick}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={!selectedProductCode}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm vào kế hoạch
          </button>
        </div>
      </div>
    </div>
  );
};