import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { XIcon } from './icons/XIcon';
import { CubeIcon } from './icons/CubeIcon';
import { InputGroup } from './InputGroup';
import { FormattedNumberInput } from './FormattedNumberInput';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  product: Product | null;
}

const initialProductState: Product = {
    code: '',
    nameVI: '',
    nameEN: '',
    brand: '',
    group: '',
    defaultWeightKg: 0,
    defaultPriceUSDPerTon: 0,
    defaultSellingPriceVND: 0,
};

export const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [editedProduct, setEditedProduct] = useState<Product>(initialProductState);

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    } else {
      setEditedProduct(initialProductState);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [id]: value }));
  };
  
  const handleNumberChange = (id: keyof Product, value: number) => {
    setEditedProduct(prev => ({ ...prev, [id]: value }));
  }

  const handleSave = () => {
    if (!editedProduct.code || !editedProduct.nameVI || !editedProduct.brand || !editedProduct.group) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc: Mã, Tên, Thương hiệu, và Nhóm.');
      return;
    }
    onSave(editedProduct);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <CubeIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Chỉnh sửa sản phẩm</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup
                    id="code"
                    label="Mã sản phẩm (Không thể thay đổi)"
                    value={editedProduct.code}
                    onChange={handleInputChange}
                    disabled
                />
                <InputGroup
                    id="brand"
                    label="Thương hiệu (Bắt buộc)"
                    value={editedProduct.brand}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Alana"
                />
            </div>
            <InputGroup
                id="nameVI"
                label="Tên tiếng Việt (Bắt buộc)"
                value={editedProduct.nameVI}
                onChange={handleInputChange}
                placeholder="Ví dụ: Thăn ngoại"
            />
            <InputGroup
                id="nameEN"
                label="Tên tiếng Anh"
                value={editedProduct.nameEN}
                onChange={handleInputChange}
                placeholder="Ví dụ: Striploin C"
            />
            <InputGroup
                id="group"
                label="Nhóm hàng (Bắt buộc)"
                value={editedProduct.group}
                onChange={handleInputChange}
                placeholder="Ví dụ: Thịt trâu"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <FormattedNumberInput
                    id="defaultWeightKg"
                    label="KL mặc định (Kg)/cont"
                    value={editedProduct.defaultWeightKg}
                    onChange={(val) => handleNumberChange('defaultWeightKg', val)}
                />
                 <FormattedNumberInput
                    id="defaultPriceUSDPerTon"
                    label="Giá nhập mặc định (USD/Tấn)"
                    value={editedProduct.defaultPriceUSDPerTon}
                    onChange={(val) => handleNumberChange('defaultPriceUSDPerTon', val)}
                    decimalPlaces={2}
                />
                 <FormattedNumberInput
                    id="defaultSellingPriceVND"
                    label="Giá bán mặc định (VND/Kg)"
                    value={editedProduct.defaultSellingPriceVND}
                    onChange={(val) => handleNumberChange('defaultSellingPriceVND', val)}
                />
            </div>
        </main>

        <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg space-x-2">
            <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
                Hủy
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
                Lưu thay đổi
            </button>
        </footer>
      </div>
    </div>
  );
};