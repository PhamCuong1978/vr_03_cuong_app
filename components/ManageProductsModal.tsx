import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { XIcon } from './icons/XIcon';
import { CubeIcon } from './icons/CubeIcon';
import { InputGroup } from './InputGroup';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface ManageProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  onEditProduct: (product: Product) => void;
  onAddNewProduct: () => void;
}

export const ManageProductsModal: React.FC<ManageProductsModalProps> = ({ isOpen, onClose, products, setProducts, onEditProduct, onAddNewProduct }) => {
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

  const handleDelete = (productCode: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm có mã "${productCode}" không? Hành động này không thể hoàn tác.`)) {
      const updatedProducts = products.filter(p => p.code !== productCode);
      setProducts(updatedProducts);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CubeIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Quản lý Danh mục Sản phẩm</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddNewProduct}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Thêm mới
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
        
        <div className="p-4 border-b flex-shrink-0">
            <InputGroup
                id="manage-product-search"
                label="Tìm kiếm sản phẩm"
                srOnlyLabel
                type="text"
                placeholder="Tìm theo mã, tên, thương hiệu, hoặc nhóm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <main className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.code} className="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-indigo-600 truncate" title={`${product.brand} - ${product.code}`}>{product.brand} - {product.code}</p>
                                <p className="text-sm text-gray-800 truncate" title={product.nameVI}>{product.nameVI}</p>
                                <p className="text-xs text-gray-500 truncate">{product.group} / {product.nameEN}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                <button
                                    onClick={() => onEditProduct(product)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                                    aria-label={`Sửa sản phẩm ${product.nameVI}`}
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.code)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                    aria-label={`Xóa sản phẩm ${product.nameVI}`}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
                    </div>
                )}
            </div>
        </main>

        <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
            <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
                Đóng
            </button>
        </footer>
      </div>
    </div>
  );
};